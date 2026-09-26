import type { NormalizedModel } from '@libs/llm/byok-config';

import { OrganizationAndTeamData } from '@libs/core/infrastructure/config/types/general/organizationAndTeamData';
import { PermissionValidationService } from '@libs/shared/infrastructure/permissions';
import { LLM_TASK } from '@libs/llm/byok-config';

/**
 * Resolved model policy for a FOSSA Rules generation run.
 */
export interface FossyRulesModelPolicy {
    generate: boolean;
    byokConfig?: NormalizedModel;
    modelOverride?: string;
    /** Set when `generate` is false — human-readable reason for the skip. */
    skipReason?: string;
}

/**
 * Decides which model a Rules generation run may use.
 * In FOSSA:
 * - BYOK configured → client's configured BYOK model slot.
 * - Otherwise → deployment's configured LLM from environment variables.
 */
export async function resolveFossyRulesModelPolicy(
    permissionValidationService: PermissionValidationService,
    organizationAndTeamData: OrganizationAndTeamData,
): Promise<FossyRulesModelPolicy> {
    const byokConfig = await permissionValidationService.resolveTaskSlot(
        organizationAndTeamData,
        LLM_TASK.ruleGeneration,
    );
    if (byokConfig) {
        return { generate: true, byokConfig };
    }

    // Default to the deployment's env model (customer keys)
    return { generate: true };
}

