import type { OrganizationLicense } from "../../subscription/_services/billing/types";

/**
 * Cockpit tier policy in FOSSA — all features are 100% free and open-source.
 * Aligned with libs/cockpit/domain/tier-policy.ts.
 */
export function isCockpitTierAllowed(
    _license?: OrganizationLicense | null | undefined,
): boolean {
    return true;
}
