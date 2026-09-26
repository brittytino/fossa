import type { Scenario } from '../lib/types.js';
import centralizedConfigSync from './centralized-config-sync.js';
import cockpitAnalytics from './cockpit-analytics.js';
import codeReviewBasic from './code-review-basic.js';
import codeReviewVertexByok from './code-review-vertex-byok.js';
import crossRepoConfig from './cross-repo-config.js';
import conversationVertexByok from './conversation-vertex-byok.js';
import conversationAnthropicByok from './conversation-anthropic-byok.js';
import conversationImplicitReply from './conversation-implicit-reply.js';
import commandReview from './command-review.js';
import commandReviewFocus from './command-review-focus.js';
import commandReviewWhileBusy from './command-review-while-busy.js';
import fossaCreditsGate from './fossa-credits-gate.js';
import fossaCreditsReview from './fossa-credits-review.js';
import fossyRulesCreateAndApply from './fossy-rules.js';
import fossyRulesFileSync from './fossy-rules-file-sync.js';
import fossyRulesLifecycle from './fossy-rules-lifecycle.js';
import ruleFileDetection from './rule-file-detection.js';
import fossyRulesCoverage from './fossy-rules-coverage.js';
import licenseAttribution from './license-attribution.js';
import onboardingWebhookRegistration from './onboarding-webhook-registration.js';
import finishOnboardingSlo from './finish-onboarding-slo.js';
import perSeatLicenseToggle from './per-seat-license-toggle.js';
import prExecutionSse from './pr-execution-sse.js';
import publicPrDemo from './public-pr-demo.js';
import reviewDecisionMemory from './review-decision-memory.js';
import reviewDecisionMemoryRevert from './review-decision-memory-revert.js';
import reviewDecisionMemoryFossyRules from './review-decision-memory-fossy-rules.js';
import rbacAuthorization from './rbac-authorization.js';
import rbacFrontendRoutes from './rbac-frontend-routes.js';
import rbacUiRender from './rbac-ui-render.js';
import ssoCookieDomain from './sso-cookie-domain.js';
import ssoMultiUser from './sso-multi-user.js';
import stripeBilling from './stripe-billing.js';
import trialCreditsConsume from './trial-credits-consume.js';
import trialEntitlementGate from './trial-entitlement-gate.js';
import trialManagedReview from './trial-managed-review.js';
import upgradeNMinusOneToN from './upgrade.js';

export const allScenarios: Record<string, Scenario> = {
    [onboardingWebhookRegistration.id]: onboardingWebhookRegistration,
    [finishOnboardingSlo.id]: finishOnboardingSlo,
    [codeReviewBasic.id]: codeReviewBasic,
    [codeReviewVertexByok.id]: codeReviewVertexByok,
    [crossRepoConfig.id]: crossRepoConfig,
    [conversationVertexByok.id]: conversationVertexByok,
    [conversationAnthropicByok.id]: conversationAnthropicByok,
    [conversationImplicitReply.id]: conversationImplicitReply,
    [centralizedConfigSync.id]: centralizedConfigSync,
    [commandReview.id]: commandReview,
    [commandReviewFocus.id]: commandReviewFocus,
    [commandReviewWhileBusy.id]: commandReviewWhileBusy,
    [cockpitAnalytics.id]: cockpitAnalytics,
    [fossyRulesCreateAndApply.id]: fossyRulesCreateAndApply,
    [fossyRulesFileSync.id]: fossyRulesFileSync,
    [fossyRulesLifecycle.id]: fossyRulesLifecycle,
    [ruleFileDetection.id]: ruleFileDetection,
    [fossyRulesCoverage.id]: fossyRulesCoverage,
    [licenseAttribution.id]: licenseAttribution,
    [perSeatLicenseToggle.id]: perSeatLicenseToggle,
    [prExecutionSse.id]: prExecutionSse,
    [publicPrDemo.id]: publicPrDemo,
    [reviewDecisionMemory.id]: reviewDecisionMemory,
    [reviewDecisionMemoryRevert.id]: reviewDecisionMemoryRevert,
    [reviewDecisionMemoryFossyRules.id]: reviewDecisionMemoryFossyRules,
    [rbacAuthorization.id]: rbacAuthorization,
    [rbacFrontendRoutes.id]: rbacFrontendRoutes,
    [rbacUiRender.id]: rbacUiRender,
    [ssoCookieDomain.id]: ssoCookieDomain,
    [ssoMultiUser.id]: ssoMultiUser,
    [stripeBilling.id]: stripeBilling,
    [fossaCreditsGate.id]: fossaCreditsGate,
    [fossaCreditsReview.id]: fossaCreditsReview,
    [trialCreditsConsume.id]: trialCreditsConsume,
    [trialEntitlementGate.id]: trialEntitlementGate,
    [trialManagedReview.id]: trialManagedReview,
    [upgradeNMinusOneToN.id]: upgradeNMinusOneToN,
};

export function resolveScenarios(ids: string[]): Scenario[] {
    return ids.map((id) => {
        const s = allScenarios[id];
        if (!s) {
            throw new Error(
                `Unknown scenario: ${id}. Known: ${Object.keys(allScenarios).join(', ')}`,
            );
        }
        return s;
    });
}

export {
    centralizedConfigSync,
    cockpitAnalytics,
    codeReviewBasic,
    codeReviewVertexByok,
    crossRepoConfig,
    conversationVertexByok,
    commandReview,
    commandReviewFocus,
    commandReviewWhileBusy,
    fossyRulesCreateAndApply,
    fossyRulesFileSync,
    fossyRulesLifecycle,
    ruleFileDetection,
    fossyRulesCoverage,
    licenseAttribution,
    onboardingWebhookRegistration,
    finishOnboardingSlo,
    perSeatLicenseToggle,
    prExecutionSse,
    publicPrDemo,
    rbacAuthorization,
    rbacFrontendRoutes,
    rbacUiRender,
    ssoCookieDomain,
    ssoMultiUser,
    stripeBilling,
    fossaCreditsGate,
    fossaCreditsReview,
    trialCreditsConsume,
    trialEntitlementGate,
    trialManagedReview,
    upgradeNMinusOneToN,
};
