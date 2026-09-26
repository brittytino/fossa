"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FOSSY_RULES_PATHS } from "@services/fossyRules";
import { useSuspenseFossyRulesByRepositoryId } from "@services/fossyRules/hooks";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import { useQueryClient } from "@tanstack/react-query";
import { addSearchParamsToUrl } from "src/core/utils/url";
import type { FossyRule } from "src/lib/services/fossyRules/types";

import { FossyRuleAddOrUpdateItemModal } from "../../../_components/modal";
import { useFullCodeReviewConfig } from "../../../../_components/context";

export function FossyRuleModalClient({
    rule,
    repositoryId,
    directoryId,
}: {
    rule: FossyRule;
    repositoryId: string;
    directoryId?: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const config = useFullCodeReviewConfig();
    const queryClient = useQueryClient();
    const scopeRules = useSuspenseFossyRulesByRepositoryId(
        repositoryId,
        directoryId,
    );
    const [hydratedRule, setHydratedRule] = useState<FossyRule>(rule);

    useEffect(() => {
        setHydratedRule(rule);
    }, [rule]);

    useEffect(() => {
        const match = scopeRules.find(
            (currentRule) => currentRule.uuid === rule.uuid,
        );
        if (match) {
            setHydratedRule(match);
        }
    }, [scopeRules, rule.uuid]);
    const canEdit = usePermission(
        Action.Update,
        ResourceType.CodeReviewSettings,
        repositoryId,
    );

    const handleClose = async () => {
        const tab = searchParams.get("tab") ?? undefined;

        await queryClient.invalidateQueries({
            predicate: (query) =>
                query.queryKey[0] ===
                    FOSSY_RULES_PATHS.FIND_BY_ORGANIZATION_ID_AND_FILTER ||
                query.queryKey[0] === FOSSY_RULES_PATHS.GET_INHERITED_RULES ||
                query.queryKey[0] === FOSSY_RULES_PATHS.FIND_BY_ORGANIZATION_ID,
        });

        router.push(
            addSearchParamsToUrl(
                `/settings/code-review/${repositoryId}/fossy-rules`,
                { directoryId, tab },
            ),
        );
    };

    const directory = config?.repositories
        .find((r) => r.id === repositoryId)
        ?.directories?.find((d) => d.id === directoryId);

    return (
        <FossyRuleAddOrUpdateItemModal
            rule={hydratedRule}
            onClose={handleClose}
            directory={directory}
            repositoryId={repositoryId}
            ruleType={hydratedRule.type}
            canEdit={canEdit}
        />
    );
}
