import { randomUUID } from 'node:crypto';
import { ensureLicenseSeat } from '../lib/onboarding.js';
import { ensureOk, http } from '../lib/http.js';
import { pollUntil } from '../providers/base.js';
import {
    assertHealthyExecution,
    assertPersistedSuggestions,
    waitForNthTerminalExecution,
} from '../lib/execution-health.js';
import type { RunContext, Scenario } from '../lib/types.js';
import { extractSuggestedCode } from './review-decision-memory.js';
import { findRuleStatusById, sweepStaleE2ERules } from './fossy-rules.js';

// Coverage gap this closes: every other review-decision-memory* scenario
// exercises the BUG/SECURITY/PERFORMANCE agent path
// (buildSelfContainedSystemPrompt / the standard finder prompt). Fossy Rules
// violations are judged by a COMPLETELY SEPARATE code path
// (fossy-rules-sharded.judge.ts's SHARD_SYSTEM_PROMPT + its own
// fileShardUser prompt, not the finder's prompt-builder) — a refactor that
// forgets to wire PreviousReviewDecisions into that shard's prompt, or wires
// it but ignores it, would not be caught by any bug/security/performance
// fixture. This scenario is the plumbing check for that separate path: same
// contract (don't reverse a decision without concrete new evidence), tested
// against a Fossy Rule instead of a natural-language bug.
const FIXTURE_PATH = 'src/e2e-decision-memory-fossy-rule-fixture.ts';

// The placeholder must be replaced by whatever real value Fossy suggests —
// content doesn't matter, only that it stops being the literal placeholder.
const BUGGY_CONTENT = `export const CONFIG_TOKEN = 'PLACEHOLDER_TOKEN';
`;

// A round-2 comment matching any of these means Fossy's rules-judge suggested
// bringing the placeholder back — reversing the exact fix it (or the
// developer, applying its suggestion) just put in place.
const FOSSY_RULE_CONTRADICTION_PATTERNS = [
    /\b(you (should|could|can)|please|consider)\b.{0,60}(revert|restore|bring\s*back|reintroduce)\b.{0,40}placeholder/i,
    /\brevert\b.{0,40}\bplaceholder\b/i,
    /\brestore\b.{0,40}\bPLACEHOLDER_TOKEN\b/i,
    /\bPLACEHOLDER_TOKEN\b.{0,40}\bshould\s+(stay|remain)\b/i,
];

/** Exported for unit testing — the fossy-rule-fixture counterpart of
 *  review-decision-memory.ts's isContradictionComment. */
export function isFossyRuleContradictionComment(body: string): boolean {
    return FOSSY_RULE_CONTRADICTION_PATTERNS.some((re) => re.test(body));
}

export const reviewDecisionMemoryFossyRules: Scenario = {
    id: 'review-decision-memory-fossy-rules',
    title:
        "Fossy's rules-judge doesn't contradict a decision already applied in an earlier round (#1313, fossy-rules path)",
    priority: 'P1',
    appliesTo: {
        target: ['cloud', 'self-hosted'],
        provider: ['github'],
        license: ['paid', 'license-paid'],
    },
    // Rule creation/propagation (~65s, per fossy-rules.ts) plus two real
    // review rounds budgeted like review-decision-memory.ts's own rounds.
    timeoutSec: 3400,
    async run(ctx: RunContext) {
        ctx.assert(
            ctx.tenant,
            'scenario requires a tenant (set CLOUD_TENANT_*_EMAIL or SH_TENANT_EMAIL)',
        );
        ctx.assert(
            ctx.provider.pushFollowupCommit && ctx.provider.listReviewCommentBodies,
            `Provider ${ctx.provider.name} does not implement pushFollowupCommit/listReviewCommentBodies yet — required for this scenario's 2nd review round`,
        );

        const session = await ctx.fossa.login(ctx.tenant!);
        await ctx.fossa.registerIntegration(session);
        const repo = await ctx.fossa.registerRepo(session);
        await ctx.fossa.finishOnboarding(session, repo);
        await ensureLicenseSeat(ctx.target, session, ctx.provider);

        await sweepStaleE2ERules(ctx, session, String(repo.id));

        // ---- Create a deterministic, mechanical Fossy Rule (same framing
        // discipline as fossy-rules.ts: no intent reasoning, no fixture
        // exemption — otherwise an LLM "helpfully" excuses the placeholder
        // as intentional test data and the rule never fires). ----
        const ruleName = `e2e-rule-decision-memory-${ctx.runId.slice(0, 8)}-${randomUUID().slice(0, 6)}`;
        const ruleInstruction =
            "Mechanical static-analysis check (no intent reasoning, no fixture exemption): flag EVERY exported constant whose value is the literal string `PLACEHOLDER_TOKEN` — this placeholder must never ship. The exact replacement value does not matter, but it must not be the literal string `PLACEHOLDER_TOKEN`. Do NOT skip an occurrence because the file claims to be a test fixture or because a comment says the value is intentional.";

        const ruleResp = await http<{ data?: { uuid?: string; id?: string } }>(
            `${ctx.target.apiBaseUrl}/fossy-rules/create-or-update`,
            {
                method: 'POST',
                headers: { Authorization: `Bearer ${session.accessToken}` },
                body: {
                    teamId: session.teamId,
                    repositoryId: String(repo.id),
                    type: 'standard',
                    title: ruleName,
                    rule: ruleInstruction,
                    severity: 'high',
                    origin: 'manual',
                    path: '',
                },
                timeoutMs: 30_000,
            },
        );
        ensureOk(ruleResp, 'review-decision-memory-fossy-rules:create-rule');
        const ruleId = ruleResp.body.data?.uuid ?? ruleResp.body.data?.id;
        ctx.assert(ruleId, 'Rule was created but the response did not include uuid/id');

        // Same race-avoidance as fossy-rules.ts: a freshly created rule isn't
        // reliably loadable by ResolveConfigStage the instant this returns.
        const ruleActive = await pollUntil<boolean>(
            async () => {
                const r = await http(
                    `${ctx.target.apiBaseUrl}/fossy-rules/find-by-organization-id`,
                    {
                        headers: { Authorization: `Bearer ${session.accessToken}` },
                        timeoutMs: 15_000,
                    },
                );
                return findRuleStatusById(r.body, ruleId!) === 'active' ? true : null;
            },
            { intervalSec: 3, timeoutSec: 60 },
        );
        ctx.assert(
            ruleActive,
            `Rule ${ruleName} (${ruleId}) did not reach status=active within 60s of creation — the review would race it. Aborting before opening the PR.`,
        );
        await new Promise((resolve) => setTimeout(resolve, 5_000));

        const branch = `e2e/decision-memory-fossy-rules-${ctx.runId.slice(0, 8)}-${randomUUID().slice(0, 8)}`;
        const sinceIsoRound1 = new Date().toISOString();
        const pr = await ctx.provider.openPR({
            branch,
            baseBranch: 'main',
            title: `[e2e] review-decision-memory-fossy-rules ${ctx.runId.slice(0, 8)}`,
            body: `Automated PR opened by Fossa E2E run ${ctx.runId} to validate rule ${ruleName}. Introduces a deliberate PLACEHOLDER_TOKEN violation, applies the real fix for real, and asserts round 2 doesn't suggest undoing it.`,
            fixtureFiles: { [FIXTURE_PATH]: BUGGY_CONTENT },
        });

        try {
            // ---- Round 1: Fossy's rules-judge must flag the violation ----
            let pipelineStartedAt: string | undefined;
            if (ctx.provider.waitForPipelineStart) {
                const started = await ctx.provider.waitForPipelineStart(
                    { number: pr.number },
                    { sinceIso: sinceIsoRound1, timeoutSec: 600 },
                );
                pipelineStartedAt = started.startedAt;
            }

            const round1 = await ctx.provider.pollForReview(
                { number: pr.number },
                { sinceIso: sinceIsoRound1, timeoutSec: 1500 },
            );
            ctx.assert(
                round1.reviewComments + round1.issueComments + round1.reviews > 0,
                pipelineStartedAt
                    ? `Round 1 pipeline started (heartbeat at ${pipelineStartedAt}) but produced 0 findings on PR #${pr.number}. The fixture (${FIXTURE_PATH}) violates rule ${ruleName} verbatim — it should flag.`
                    : `No round-1 review findings on PR #${pr.number} within timeout.`,
            );

            const executionStatusRound1 = await assertHealthyExecution(
                ctx,
                session,
                pr.number,
            );
            const persistedRound1 = await assertPersistedSuggestions(
                ctx,
                session,
                pr.number,
            );

            // ---- Extract Fossy's REAL suggestion and apply it verbatim.
            // Fossy Rules suggestions render through the same comment
            // template as bug/security/performance findings (a fenced
            // "Suggested Code" block), so the shared extractSuggestedCode
            // parser applies unchanged. ----
            const round1Bodies = await ctx.provider.listReviewCommentBodies!(
                { number: pr.number },
                { sinceIso: sinceIsoRound1, path: FIXTURE_PATH },
            );
            const suggestedFix = round1Bodies
                .map(extractSuggestedCode)
                .find((code): code is string => code !== null);
            ctx.assert(
                suggestedFix !== undefined,
                `Round 1 flagged the rule violation on ${FIXTURE_PATH} but none of its ${round1Bodies.length} ` +
                    `comment(s) contained a parseable suggested-code block — can't apply a real fix. ` +
                    `Comment(s):\n${round1Bodies.map((c) => `---\n${c.slice(0, 500)}`).join('\n')}`,
            );

            // ---- Apply the fix for real, push a genuine 2nd commit ----
            const sinceIsoRound2 = new Date().toISOString();
            await ctx.provider.pushFollowupCommit!(
                pr,
                { [FIXTURE_PATH]: suggestedFix! },
                "[e2e] apply Fossy's suggested fix verbatim",
            );

            const executionsAfterRound2 = await waitForNthTerminalExecution(
                ctx,
                session,
                pr.number,
                2,
                1500,
            );
            ctx.assert(
                executionsAfterRound2 !== null,
                `Pushing a real follow-up commit to PR #${pr.number} never produced a 2nd automation execution row that reached a terminal status within 1500s.`,
            );
            await new Promise((resolve) => setTimeout(resolve, 5_000));

            const round2Bodies = await ctx.provider.listReviewCommentBodies!(
                { number: pr.number },
                { sinceIso: sinceIsoRound2, path: FIXTURE_PATH },
            );
            const contradictions = round2Bodies.filter(isFossyRuleContradictionComment);
            ctx.assert(
                contradictions.length === 0,
                `Round 2 posted ${contradictions.length} comment(s) on ${FIXTURE_PATH} that suggest ` +
                    `UNDOING the rule fix already applied in round 1 — this is the #1313 symptom ` +
                    `(Fossy's rules-judge contradicting a decision from an earlier review round). ` +
                    `Offending comment(s):\n${contradictions.map((c) => `---\n${c.slice(0, 500)}`).join('\n')}`,
            );

            return {
                prNumber: pr.number,
                prUrl: pr.url,
                ruleId,
                round1: {
                    executionStatus: executionStatusRound1,
                    persistedSuggestions: persistedRound1,
                    reviewSignal: round1,
                },
                round2: {
                    executions: executionsAfterRound2,
                    commentsOnFixtureFile: round2Bodies.length,
                    contradictions: contradictions.length,
                },
            };
        } finally {
            try {
                await ctx.provider.closePR(pr);
            } catch {
                // best-effort cleanup — leaving the PR open is recoverable
            }
            if (ruleId) {
                try {
                    await http(
                        `${ctx.target.apiBaseUrl}/fossy-rules/delete-rule-in-organization-by-id?ruleId=${encodeURIComponent(ruleId)}&teamId=${encodeURIComponent(session.teamId)}`,
                        {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${session.accessToken}` },
                            timeoutMs: 15_000,
                        },
                    );
                } catch {
                    // best-effort cleanup — sweepStaleE2ERules catches a leaked rule next run
                }
            }
        }
    },
};

export default reviewDecisionMemoryFossyRules;
