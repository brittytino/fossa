import { FossyRulesStatus } from "@services/fossyRules/types";

import { resolveFossyRuleBadgeState } from "./resolve-badge-state";

describe("resolveFossyRuleBadgeState", () => {
    it("returns null for an active rule", () => {
        expect(
            resolveFossyRuleBadgeState({ status: FossyRulesStatus.ACTIVE }),
        ).toBeNull();
    });

    it("returns 'locked' for a rule paused by the plan limit on free plan", () => {
        expect(
            resolveFossyRuleBadgeState({
                status: FossyRulesStatus.PAUSED,
                lockedByPlan: true,
            }, true),
        ).toBe("locked");
    });

    it("returns 'locked' by default when isFreePlan not provided (backward compat)", () => {
        expect(
            resolveFossyRuleBadgeState({
                status: FossyRulesStatus.PAUSED,
                lockedByPlan: true,
            }),
        ).toBe("locked");
    });

    it("returns 'paused' even with lockedByPlan on a paid plan", () => {
        expect(
            resolveFossyRuleBadgeState({
                status: FossyRulesStatus.PAUSED,
                lockedByPlan: true,
            }, false),
        ).toBe("paused");
    });

    it("returns 'paused' for a rule the user paused themselves", () => {
        expect(
            resolveFossyRuleBadgeState({
                status: FossyRulesStatus.PAUSED,
                lockedByPlan: false,
            }),
        ).toBe("paused");
    });

    it("returns 'paused' when lockedByPlan is absent (legacy/manual pauses)", () => {
        expect(
            resolveFossyRuleBadgeState({ status: FossyRulesStatus.PAUSED }),
        ).toBe("paused");
    });

    it("returns null for other statuses (pending, rejected, deleted)", () => {
        expect(
            resolveFossyRuleBadgeState({
                status: FossyRulesStatus.PENDING,
                lockedByPlan: true,
            }),
        ).toBeNull();
    });
});
