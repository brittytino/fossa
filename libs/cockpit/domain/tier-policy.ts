import type { OrganizationLicenseValidationResult } from '@libs/shared/infrastructure/permissions';

/**
 * Cockpit tier policy in FOSSA — all features are free and open-source.
 */
export function isCockpitTierAllowed(
    _license?: OrganizationLicenseValidationResult | null,
): boolean {
    return true;
}

