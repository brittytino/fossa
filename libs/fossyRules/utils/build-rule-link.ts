import { FossyRulesStatus } from '@libs/fossyRules/domain/interfaces/fossyRules.interface';

export type FossyRuleAppLinkTab = 'memories' | 'review-rules';

export interface BuildFossyRuleAppLinkParams {
    repositoryId: string | null | undefined;
    ruleId: string | undefined;
    teamId?: string;
    status?: FossyRulesStatus;
    tab: FossyRuleAppLinkTab;
    baseUrl?: string;
}

export function buildFossyRuleAppLink({
    repositoryId,
    ruleId,
    teamId,
    status,
    tab,
    baseUrl,
}: BuildFossyRuleAppLinkParams): string {
    const resolvedBaseUrl = (
        baseUrl ?? process.env.API_USER_INVITE_BASE_URL ?? ''
    ).replace(/\/$/, '');

    if (!resolvedBaseUrl) {
        return '';
    }

    const scope =
        repositoryId && repositoryId !== 'global' ? repositoryId : 'global';

    const url = new URL(resolvedBaseUrl);

    if (status === FossyRulesStatus.PENDING || !ruleId) {
        url.pathname = `/settings/code-review/${scope}/fossy-rules`;
        url.searchParams.set('tab', tab);
        return url.toString();
    }

    url.pathname = `/settings/code-review/${scope}/fossy-rules/${ruleId}`;
    url.searchParams.set('tab', tab);

    if (teamId) {
        url.searchParams.set('teamId', teamId);
    }

    return url.toString();
}
