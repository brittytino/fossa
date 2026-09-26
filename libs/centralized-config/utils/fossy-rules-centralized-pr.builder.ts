import {
    CentralizedConfigPrService,
    CentralizedMutationPullRequestRequest,
} from '@libs/centralized-config/infrastructure/adapters/services/centralized-config-pr.service';
import { dumpCentralizedYaml } from '@libs/centralized-config/utils/yaml-dump';
import { OrganizationAndTeamData } from '@libs/core/infrastructure/config/types/general/organizationAndTeamData';
import {
    IFossyRule,
    FossyRulesStatus,
    FossyRulesType,
} from '@libs/fossyRules/domain/interfaces/fossyRules.interface';

export type FossyRuleMutationOperation = 'create' | 'update' | 'delete';

interface BuildFossyRuleCentralizedMutationRequestParams {
    centralizedConfigPrService: CentralizedConfigPrService;
    organizationAndTeamData: OrganizationAndTeamData;
    repositoryId?: string;
    groupFolderName?: string;
    ruleContent: Partial<IFossyRule>;
    ruleType: FossyRulesType;
    operation: FossyRuleMutationOperation;
}

export function buildFossyRuleCentralizedMutationRequest(
    params: BuildFossyRuleCentralizedMutationRequestParams,
): CentralizedMutationPullRequestRequest {
    const isMemory = params.ruleType === FossyRulesType.MEMORY;
    const rulesDirectory = isMemory ? 'memories' : 'review';
    const operationLabel =
        params.operation === 'delete' ? 'remove' : params.operation;

    return {
        organizationAndTeamData: params.organizationAndTeamData,
        repositoryId: params.repositoryId,
        files: ({ repositoryFolder }) => {
            const path = buildFossyRuleCentralizedFilePath({
                centralizedConfigPrService: params.centralizedConfigPrService,
                repositoryFolder,
                rulesDirectory,
                ruleContent: params.ruleContent,
                groupFolderName: params.groupFolderName,
            });

            if (params.operation === 'delete') {
                return [{ path, operation: 'delete' }];
            }

            return [
                {
                    path,
                    content: formatRuleToYaml(params.ruleContent),
                    operation: 'upsert',
                },
            ];
        },
        title: ({ repositoryFolder }) =>
            `${params.operation === 'delete' ? 'Remove' : 'Update'} ${isMemory ? 'Fossy Memory' : 'Fossy Rule'} from ${repositoryFolder}`,
        description:
            params.operation === 'delete'
                ? 'This pull request proposes removing a centralized Fossy file.'
                : 'This pull request proposes a centralized Fossy configuration change.',
        commitMessage: `${operationLabel} ${isMemory ? 'memory' : 'rule'} via centralized config`,
        sourceBranch: () =>
            `fossa-centralized-${params.ruleType}-${params.operation}-${Date.now()}`,
    };
}

export function buildFossyRuleCentralizedFilePath(params: {
    centralizedConfigPrService: CentralizedConfigPrService;
    repositoryFolder: string;
    rulesDirectory: string;
    ruleContent: Partial<IFossyRule>;
    groupFolderName?: string;
}): string {
    const normalizedPath = normalizeCentralizedPath(
        params.ruleContent.centralizedConfig?.path,
    );

    if (normalizedPath) {
        return normalizedPath;
    }

    const fileName = params.centralizedConfigPrService.buildRuleFileName(
        params.ruleContent.title,
        params.ruleContent.uuid,
    );

    if (params.groupFolderName) {
        return params.centralizedConfigPrService.buildDirectoryGroupRulesPath(
            params.repositoryFolder,
            params.groupFolderName,
            params.rulesDirectory,
            fileName,
        );
    }

    return params.centralizedConfigPrService.buildCentralizedPath({
        repositoryFolder: params.repositoryFolder,
        relativePath: `.fossy-rules/${params.rulesDirectory}/${fileName}`,
    });
}

function normalizeCentralizedPath(path?: string): string | null {
    const normalized = path?.trim();

    if (
        !normalized ||
        normalized.startsWith('/') ||
        normalized.includes('..')
    ) {
        return null;
    }

    return normalized;
}

export function formatRuleToYaml(rule: Partial<IFossyRule>): string {
    const ruleForYaml = {
        title: rule.title,
        rule: rule.rule,
        ...(rule.severity ? { severity: rule.severity } : {}),
        ...(rule.scope ? { scope: rule.scope } : {}),
        ...(rule.path ? { path: rule.path } : {}),
        ...(rule.examples ? { examples: rule.examples } : {}),
        ...(rule.inheritance ? { inheritance: rule.inheritance } : {}),
        // Present = enforced. A paused rule stays in the config but is not
        // enforced; absence means enabled (keeps active-rule files unchanged).
        ...(rule.status === FossyRulesStatus.PAUSED ? { enabled: false } : {}),
    };

    // `examples`/`inheritance` arrive as DTO class instances, which js-yaml
    // refuses to dump. Same hazard on every centralized-config dump, so it is
    // handled in one place.
    return dumpCentralizedYaml(ruleForYaml);
}
