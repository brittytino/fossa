import { redirect } from "next/navigation";
import { getLibraryFossyRulesWithFeedback } from "@services/fossyRules/fetch";
import { getTeamParameters } from "@services/parameters/fetch";
import { ParametersConfigKey } from "@services/parameters/types";
import type { AutomationCodeReviewConfigType } from "src/app/(app)/settings/code-review/_types";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";

import { FossyRuleLibraryItemModal } from "./_components/modal";

export default async function Route(context: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ repositoryId?: string; directoryId?: string }>;
}) {
    // params, searchParams, the rules list and the selected team id are all
    // independent — resolve them in one round-trip instead of chaining four.
    // getTeamParameters still depends on teamId and runs after the rule guard.
    const [params, searchParams, rulesResponse, teamId] = await Promise.all([
        context.params,
        context.searchParams,
        getLibraryFossyRulesWithFeedback({
            page: 1,
            limit: 1000, // Use maximum allowed limit to get all rules
        }),
        getGlobalSelectedTeamId(),
    ]);

    const rules = rulesResponse?.data || [];
    const rule = rules.find((r) => r.uuid === params.id);
    if (!rule) redirect("/library/fossy-rules");

    const { configValue } = await getTeamParameters<{
        configValue: AutomationCodeReviewConfigType;
    }>({
        key: ParametersConfigKey.CODE_REVIEW_CONFIG,
        teamId,
    });

    return (
        <FossyRuleLibraryItemModal
            key={rule.uuid}
            rule={rule}
            repositoryId={searchParams.repositoryId}
            directoryId={searchParams.directoryId}
            repositories={configValue.repositories}
        />
    );
}
