import { SeverityLevel } from '@libs/common/utils/enums/severityLevel.enum';
import z from 'zod';

export { SeverityLevel } from '@libs/common/utils/enums/severityLevel.enum';

export interface FindMemoriesFilters {
    repositoryId?: string;
    directoryId?: string;
    path?: string;
    keywords?: string[];
    limit?: number;
}

export interface FindMemoriesResult {
    uuid?: string;
    title: string;
    rule: string;
    repositoryId: string;
    directoryId?: string;
    path?: string;
    createdAt?: string;
    link: string;
}

export enum FossyRuleProcessingStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

export interface IFossyRuleReferenceSyncError {
    readonly fileName: string;
    readonly message: string;
    readonly errorType:
        | 'not_found'
        | 'invalid_path'
        | 'fetch_error'
        | 'file_too_large'
        | 'parsing_error';
    readonly attemptedPaths?: string[];
    readonly timestamp: Date;
}

export interface IFossyRules {
    uuid?: string;
    organizationId: string;
    rules: Partial<IFossyRule>[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IFossyRule {
    uuid?: string;
    title: string;
    rule: string;
    path?: string;
    sourcePath?: string;
    centralizedConfig?: IFossyRuleCentralizedConfig;
    sourceAnchor?: string;
    status: FossyRulesStatus;
    severity: string;
    label?: string;
    type?: FossyRulesType;
    extendedContext?: IFossyRulesExtendedContext;
    examples?: IFossyRulesExample[];
    /**
     * T0 compiled detector (issue #1449). When present, this rule is mechanical
     * and is checked at review time by running this pattern over added lines —
     * no LLM. Compiled once at authoring by the detector compiler and validated
     * by its gate; absent when the rule is semantic (judged by the LLM). Stored
     * inline on the embedded rule (the Mongo `rules` array is Mixed, so no
     * schema migration is needed).
     */
    detector?: IFossyRuleDetector;
    /**
     * Structured validation summary for LONG rules (> 1000 chars), generated
     * once by an LLM ("WHAT TO VALIDATE / HOW TO VALIDATE" bullets) and reused
     * on every review — measured to nearly double occurrence-recall on terse
     * models without regressing strong ones (docs/plans/
     * fossy-rules-summary-productization.md).
     *
     * Consumed EXCLUSIVELY by the code-review path (the shard prompt swaps
     * `rule` for `summary.content` when `sourceHash` matches the current rule
     * text). UI, sync and export always use the full `rule`. A stale summary
     * (hash mismatch after an edit some write path missed) is ignored and
     * logged, never used. Stored inline on the embedded rule (the Mongo
     * `rules` array is a plain Array, so no schema migration is needed).
     */
    summary?: IFossyRuleSummary;
    /**
     * Atomic decomposition (see IFossyRuleAtoms). Review-path only, like
     * `summary`; stored inline on the embedded rule (plain Array in Mongo,
     * no migration).
     */
    atoms?: IFossyRuleAtoms;
    /**
     * What this rule must SEE to be judged honestly (issue #1826). Absent means
     * `diff-only`, i.e. today's behavior — every rule judged against one file's
     * hunks and about three lines of context. Inferred once at save by the same
     * compile call that decides the detector, or set by the author; stored
     * inline on the embedded rule, like `detector`, `summary` and `atoms`.
     */
    contextNeed?: IFossyRuleContextNeed;
    /**
     * The file kinds this rule's own text scopes it to (issue #1826).
     *
     * Distinct from `path`, which the AUTHOR writes as a glob, and from
     * `scope`, which says file-level vs PR-level. This is the language scope
     * the rule states in prose — "Ruby does not require semicolons", "in our
     * migrations", "in React components" — inferred once at save by the same
     * compile call that decides the detector, or set by the author.
     *
     * Why it lives on the RULE and not inside `detector.extensions`, where
     * #1831 first put it: a detector exists only for MECHANICAL rules. Measured
     * on the fleet, that is 816 of 10.918 active rules (7,5%) — so as long as
     * the scope lived in the detector plan, the other 92,5% had nowhere to
     * record it and the semantic judge sharded every rule against every file
     * regardless of what the rule said about itself. `detector.extensions`
     * stays as the mechanical router's copy; both narrow through the same
     * `extensionScopeAppliesToFile` predicate.
     */
    fileScope?: IFossyRuleFileScope;
    /**
     * Record that the detector compiler already ran on this exact rule text and
     * examples. Purely a cost gate — it changes no review behavior.
     *
     * Without it the nightly sweep asked "does this rule have a detector?" to
     * decide what to compile, and a DECLINED rule never gets one: 92,5% of the
     * fleet was therefore recompiled every night forever, on the customer's own
     * BYOK key, to reach the same verdict. See `ruleCompileHash`.
     */
    compileAttempt?: IFossyRuleCompileAttempt;
    repositoryId: string;
    /**
     * For rules synced into the global scope (`repositoryId="global"`,
     * `origin=GLOBAL_REPO_FILE_SYNC`), the id of the source repository the file
     * was imported from. Undefined for every other kind of rule. Required to
     * (a) route incremental updates from that repo's merged PRs, (b) soft-delete
     * only this repo's global rules when it's removed as a source (never touching
     * user-authored global rules), and (c) key the upsert as
     * (`"global"`, `sourceRepositoryId`, `sourcePath`) so two source repos with
     * the same file path (e.g. `CLAUDE.md`) don't collide.
     */
    sourceRepositoryId?: string;
    /**
     * Git blob SHA of the source file at the last successful sync. Enables the
     * cheap short-circuit on manual resync: skip re-converting files whose SHA
     * is unchanged. Populated by the global sync flow.
     */
    lastContentHash?: string;
    origin?: FossyRulesOrigin;
    createdAt?: Date;
    updatedAt?: Date;
    reason?: string | null;
    scope?: FossyRulesScope;
    directoryId?: string;
    inheritance?: IFossyRulesInheritance;
    contextReferenceId?: string;
    requestType?: FossyRuleRequestType;
    targetRuleUuid?: string;
    resolvedAt?: Date;
    resolvedBy?: string;
    /**
     * Set by the IDE-rule sync flow when the source file currently
     * carries an `@fossy-sync` marker — the per-file override that
     * keeps a rule synchronized even with the repository's
     * `ideRulesSyncEnabled=false`. Recomputed from file content on
     * every sync, so flipping the toggle or editing the marker
     * self-corrects on the next sync of that file.
     *
     * Consumed by the web UI to exclude such rules from the
     * "orphan auto-sync" chip (they're not orphans, the backend
     * keeps maintaining them) and to render a pin affordance on
     * the Auto-sync origin badge.
     */
    pinnedSync?: boolean;
    /**
     * Set when this rule was auto-paused at creation/reactivation time
     * because activating it would have exceeded the free plan's active-rule
     * quota (`FossyRulesService.resolveStatusWithinPlanLimit`). Distinguishes a
     * plan-limit lock from a rule the user paused themselves — the web UI
     * renders these as "Locked" with an upgrade CTA instead of a plain
     * pause toggle. Cleared whenever the rule transitions to `ACTIVE`
     * (`FossyRulesService.createOrUpdate` clears it once the org is back
     * under quota or the plan changes).
     *
     * NOTE: This flag is persisted at write time and is stale-safe on reads
     * — the review pipeline (`codeBaseConfig.service.ts`) normalizes
     * `PAUSED + lockedByPlan` back to `ACTIVE` when `shouldLimitResources`
     * is false (i.e., the org is on a paid plan). See #1626.
     */
    lockedByPlan?: boolean;
}

export interface IFossyRuleCentralizedConfig {
    path: string;
    status: FossyRuleCentralizedStatus;
}

export interface IFossyRuleMemory extends Omit<
    IFossyRule,
    | 'type'
    | 'severity'
    | 'scope'
    | 'examples'
    | 'inheritance'
    | 'contextReferenceId'
    | 'extendedContext'
    | 'sourceAnchor'
> {
    type: FossyRulesType.MEMORY;
}

export interface IFossyRulesExtendedContext {
    todo: string;
}

export interface IFossyRulesExample {
    snippet: string;
    isCorrect: boolean;
}

/**
 * The context a rule needs beyond the diff to be judged (issue #1826).
 *
 * Rules whose truth lives outside the hunk either fire wrongly ("this import is
 * unused" when it is used twenty lines below) or cannot fire at all ("every new
 * endpoint has a test"). Declaring the need is what lets the pipeline retrieve
 * exactly that slice — and, when it cannot, skip the rule instead of judging it
 * blind.
 *
 * `diff-only` is the safe direction and the default: an over-declared need
 * means the customer's rule stops being judged on a sandbox-less review.
 */
export type FossyRuleContextNeed =
    | 'diff-only'
    /**
     * The rest of THIS file. The issue's own table calls this the majority
     * case: "is this import used later", "is this function too long", "does
     * every class here have a docstring", "is this block already written above".
     * None of them can be judged from a hunk, and only the first leaves an
     * assertion a grep could refute afterwards — so for the rest, seeing the
     * scope is the only thing that works.
     *
     * It was tried once as an unconditional whole-file attachment on every
     * shard instead of a declared need, and measured worse on every axis:
     * -14pp recall (untouched code invites comments on untouched code),
     * +85.4% input tokens on every shard including the ones that never needed
     * it, and 94.2% of changed bytes never delivered anyway because a file over
     * the budget was dropped whole. Declared and sliced, the cost lands only on
     * the rules that asked and a large file degrades to its enclosing scope
     * instead of to nothing.
     */
    | 'full-file'
    | 'symbol-references'
    | 'sibling-file'
    | 'cited-file';

export interface IFossyRuleContextNeed {
    need: FossyRuleContextNeed;
    /** sha256 of the exact `rule` text the inference was made from. */
    sourceHash: string;
    /**
     * Who decided. An `author` value is never overwritten by inference — the
     * rule's owner outranks the compiler's guess about their own rule.
     */
    source: 'compiler' | 'author';
    inferredAt: Date;
    /** Model id that inferred it. Absent for an author-set value. */
    model?: string;
}

/**
 * A rule's inferred language scope (see `IFossyRule.fileScope`). Same envelope
 * as `IFossyRuleContextNeed` — hash-gated against the rule text, and an author
 * value the compiler never overwrites — because it is inferred by the same
 * call, from the same text, and must go stale on the same edit.
 */
export interface IFossyRuleFileScope {
    /**
     * Lowercase, dot-prefixed suffixes: ['.rb', '.rake', '.erb'], and compound
     * kinds like '.blade.php' or '.spec.ts'. Matched by SUFFIX, so '.ts'
     * covers 'a.spec.ts' while '.spec.ts' covers only the spec files.
     *
     * Never empty: an empty list would be indistinguishable from "scoped to
     * nothing", so a rule that is genuinely language-agnostic ("no hardcoded
     * credentials") carries NO `fileScope` at all.
     */
    extensions: string[];
    /** sha256 of the exact `rule` text the inference was made from. */
    sourceHash: string;
    /**
     * Who decided. An `author` value is never overwritten by inference — the
     * rule's owner outranks the compiler's guess about their own rule.
     */
    source: 'compiler' | 'author';
    inferredAt: Date;
    /** Model id that inferred it. Absent for an author-set value. */
    model?: string;
}

/**
 * A record that the compiler RAN, independent of what it concluded.
 *
 * Deliberately not merged into `detector`: the whole point is to remember the
 * attempt on the rules that got no detector, which is most of them. And
 * deliberately not merged into `fileScope` or `contextNeed` either — those
 * record a RESULT and are absent when the result is "nothing", so neither can
 * distinguish "never asked" from "asked, answer was none".
 */
export interface IFossyRuleCompileAttempt {
    /** `ruleCompileHash` of the rule text + examples this attempt ran on. */
    sourceHash: string;
    attemptedAt: Date;
    /**
     * What the gate concluded. `declined` is the normal outcome and is exactly
     * the case the marker exists for; an ERRORED attempt is never recorded, so
     * a transport failure cannot freeze a rule out of ever being compiled.
     */
    outcome: 'compiled' | 'declined';
    /** Why, when declined — the same vocabulary `CompileResult` reports. */
    declineReason?: string;
    /** Model marker that ran it ('byok' | 'system'). */
    model?: string;
}

export interface IFossyRuleSummary {
    /** "WHAT TO VALIDATE / HOW TO VALIDATE" bullets, English, plain text. */
    content: string;
    /** sha256 of the exact `rule` text the summary was generated from. */
    sourceHash: string;
    generatedAt: Date;
    /** Model id that generated it (BYOK main or managed default). */
    model: string;
}

/**
 * One atomic requirement decomposed from a LONG compound rule. Atoms are the
 * review-time unit of judgment: each is fed to the shard judge as its own
 * numbered item (or, when `detector` compiled, checked by the T0 regex sweep
 * with zero LLM). Suggestions always map back to the PARENT rule's uuid — the
 * customer only ever sees their own rule cited.
 */
export interface IFossyRuleAtom {
    /** Stable id: `${parentUuid}-atom-${n}`. */
    id: string;
    /** Short imperative label for the single condition. */
    title: string;
    /** One-condition "WHAT / HOW" validation spec, English. */
    spec: string;
    /** Atom-specific bad/good snippets — also the compile gate's material. */
    examples?: IFossyRulesExample[];
    /** Present when the atom compiled into a T0 regex (deterministic path). */
    detector?: IFossyRuleDetector;
    /** Audit: why the compiler kept this atom on the LLM path. */
    declineReason?: string;
}

/**
 * Atomic decomposition of a long rule (> threshold), generated once and
 * reused on every review. Replaces `summary` as the primary review-time
 * artifact when present and fresh; `summary` remains the fallback.
 * Validated on the Rails convention analog eval (2 reps/model, deliverable
 * recall): glm 76%→92%, gpt-5.4-mini 79%→84%, kimi flat — and the compound
 * -rule blind spots (requirements buried among ~18 siblings) broke.
 */
export interface IFossyRuleAtoms {
    items: IFossyRuleAtom[];
    /**
     * sha256 over `rule` text AND serialized `examples`: examples gate the
     * atom detectors, so an example edit must invalidate the decomposition
     * (unlike `summary.sourceHash`, which covers the rule text only).
     */
    sourceHash: string;
    generatedAt: Date;
    model: string;
}

/**
 * A compiled, deterministic detector for a mechanical rule (T0, issue #1449).
 * Currently a single regex applied to added-line CONTENT; the multi-clause DSL
 * (any/all/unless/ast) is a later extension of this shape.
 */
export interface IFossyRuleDetector {
    type: 'regex';
    /** JS-compatible regex source (no slashes). */
    pattern: string;
    flags?: string;
    /** model that compiled it (audit / recompile). */
    compiledBy?: string;
    /** short rationale from the compiler. */
    reason?: string;
    /**
     * File extensions the rule's OWN TEXT scopes it to, lowercase and
     * dot-prefixed (e.g. ['.rb', '.erb']). Emitted by the compiler when the
     * rule names a language, absent when the rule is language-agnostic.
     *
     * Why (issue #1831): a regex has no notion of language, so a Ruby-only
     * rule ("Ruby does not require semicolons") compiled to `;\s*$` matched
     * every JS/SCSS/YAML line in the PR — 93.6% of its hits on a real
     * polyglot corpus were on files the rule does not even apply to. This is
     * a COST filter, not the safety net: a candidate outside these extensions
     * is dropped before it costs an LLM call. The safety net is that no
     * candidate is published without the judge confirming it.
     *
     * Absent/empty = no extension filter (unchanged behavior).
     */
    extensions?: string[];
}

export interface IFossyRulesInheritance {
    inheritable: boolean;
    exclude: string[];
    include: string[];
}

export interface IFossyRuleExternalReference {
    readonly filePath: string;
    readonly originalText?: string; // Texto original da referência (ex: "@file:README.md")
    readonly lineRange?: {
        start: number;
        end: number;
    };
    readonly description?: string;
    readonly repositoryName?: string;
    readonly lastContentHash?: string; // Hash do conteúdo do arquivo
    readonly lastValidatedAt?: Date;
    readonly estimatedTokens?: number;
    readonly lastFetchError?: {
        readonly message: string;
        readonly errorType: string;
        readonly timestamp: Date;
    };
}

/** Where a Fossy Rule or Memory came from. */
export enum FossyRulesOrigin {
    MANUAL = 'manual',
    LIBRARY = 'library',
    PAST_REVIEWS = 'past_reviews',
    REPO_FILE_SYNC = 'repo_file_sync',
    /**
     * Global Fossy Rule imported by syncing rule files from a repository the user
     * selected as a global-rules source (distinct from the per-repo
     * `REPO_FILE_SYNC`). Stored under `repositoryId="global"` alongside
     * user-authored global rules and the onboarding fast-sync scratch, so this
     * origin (together with `sourceRepositoryId`) is what distinguishes these
     * rules for filtering, cleanup on deselect, and the UI badge.
     */
    GLOBAL_REPO_FILE_SYNC = 'global_repo_file_sync',
    ONBOARDING_REPO_ANALYSIS = 'onboarding_repo_analysis',
    MCP_AGENT = 'mcp_agent',
    CLI = 'cli',
}

export enum FossyRulesStatus {
    ACTIVE = 'active',
    REJECTED = 'rejected',
    PENDING = 'pending',
    APPLIED = 'applied',
    DELETED = 'deleted',
    /**
     * Soft-disable: rule remains in the user's list (and in audit history)
     * but is not enforced by the code review pipeline. Used by the IDE
     * auto-sync toggle-off "Pause enforcement" action so users can disable
     * imported rules without losing them, and resume them later.
     *
     * Filters that gate enforcement (e.g. `FossyRulesValidationService.filterFossyRules`)
     * MUST treat `PAUSED` the same as non-`ACTIVE` and skip the rule.
     * Filters that gate visibility (e.g. listing the user's rules) MUST
     * keep `PAUSED` rules so the UI can surface them and let the user
     * resume.
     */
    PAUSED = 'paused',
}

export enum FossyRuleCentralizedStatus {
    SYNCED = 'synced',
    PENDING_ADD = 'pending_add',
    PENDING_EDIT = 'pending_edit',
    PENDING_DELETE = 'pending_delete',
}

export enum FossyRulesScope {
    PULL_REQUEST = 'pull-request',
    FILE = 'file',
}

export enum FossyRulesType {
    STANDARD = 'standard',
    MEMORY = 'memory',
}

// A pending request to add a new rule/memory (CREATE) or to change an existing
// one (UPDATE, carrying `targetRuleUuid`). Applies to both rules and memories.
export enum FossyRuleRequestType {
    CREATE = 'create',
    UPDATE = 'update',
}

/**
 * Resolves the effective SeverityLevel for a Fossy Rule.
 * Reads `severity` (the only source of truth); defaults to HIGH when missing
 * or set to an unrecognized value.
 */
export function resolveFossyRuleSeverityLevel(
    rule: Partial<IFossyRule>,
): SeverityLevel {
    switch ((rule.severity || '').toLowerCase()) {
        case SeverityLevel.CRITICAL:
            return SeverityLevel.CRITICAL;
        case SeverityLevel.HIGH:
            return SeverityLevel.HIGH;
        case SeverityLevel.MEDIUM:
            return SeverityLevel.MEDIUM;
        case SeverityLevel.LOW:
            return SeverityLevel.LOW;
        default:
            return SeverityLevel.HIGH;
    }
}

export const fossyRulesTypeSchema = z.enum([...Object.values(FossyRulesType)] as [
    FossyRulesType,
    ...FossyRulesType[],
]);

export const fossyRulesExtendedContextSchema = z.object({
    todo: z.string(),
});

export const fossyRulesExampleSchema = z.object({
    snippet: z.string(),
    isCorrect: z.boolean(),
});

export const fossyRulesInheritanceSchema = z.object({
    inheritable: z.boolean(),
    exclude: z.array(z.string()),
    include: z.array(z.string()),
});

export const fossyRuleExternalReferenceSchema = z.object({
    filePath: z.string(),
    originalText: z.string().optional(),
    lineRange: z
        .object({
            start: z.number(),
            end: z.number(),
        })
        .optional(),
    description: z.string().optional(),
    repositoryName: z.string().optional(),
    lastContentHash: z.string().optional(),
    lastValidatedAt: z.date().optional(),
    estimatedTokens: z.number().optional(),
    lastFetchError: z
        .object({
            message: z.string(),
            errorType: z.string(),
            timestamp: z.date(),
        })
        .optional(),
});

export const fossyRuleReferenceSyncErrorSchema = z.object({
    fileName: z.string(),
    message: z.string(),
    errorType: z.enum([
        'not_found',
        'invalid_path',
        'fetch_error',
        'file_too_large',
        'parsing_error',
    ]),
    attemptedPaths: z.array(z.string()).optional(),
    timestamp: z.date(),
});

const fossyRulesOriginSchema = z.enum([...Object.values(FossyRulesOrigin)] as [
    FossyRulesOrigin,
    ...FossyRulesOrigin[],
]);

const fossyRulesStatusSchema = z.enum([...Object.values(FossyRulesStatus)] as [
    FossyRulesStatus,
    ...FossyRulesStatus[],
]);

const fossyRuleCentralizedStatusSchema = z.enum([
    ...Object.values(FossyRuleCentralizedStatus),
] as [FossyRuleCentralizedStatus, ...FossyRuleCentralizedStatus[]]);

const fossyRulesScopeSchema = z.enum([...Object.values(FossyRulesScope)] as [
    FossyRulesScope,
    ...FossyRulesScope[],
]);

const fossyRuleRequestTypeSchema = z.enum([
    ...Object.values(FossyRuleRequestType),
] as [FossyRuleRequestType, ...FossyRuleRequestType[]]);

export const fossyRuleSchema = z.object({
    uuid: z.string().optional(),
    title: z.string(),
    rule: z.string(),
    path: z.string().optional(),
    sourcePath: z.string().optional(),
    centralizedConfig: z
        .object({
            path: z.string(),
            status: fossyRuleCentralizedStatusSchema,
        })
        .optional(),
    sourceAnchor: z.string().optional(),
    status: fossyRulesStatusSchema,
    severity: z.string(),
    label: z.string().optional(),
    type: fossyRulesTypeSchema.optional(),
    extendedContext: fossyRulesExtendedContextSchema.optional(),
    examples: z.array(fossyRulesExampleSchema).optional(),
    repositoryId: z.string(),
    sourceRepositoryId: z.string().optional(),
    lastContentHash: z.string().optional(),
    origin: fossyRulesOriginSchema.optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    reason: z.string().nullable().optional(),
    scope: fossyRulesScopeSchema.optional(),
    inheritance: fossyRulesInheritanceSchema.optional(),
    directoryId: z.string().optional(),
    contextReferenceId: z.string().optional(),
    requestType: fossyRuleRequestTypeSchema.optional(),
    targetRuleUuid: z.string().optional(),
    resolvedAt: z.date().optional(),
    resolvedBy: z.string().optional(),
    pinnedSync: z.boolean().optional(),
});
