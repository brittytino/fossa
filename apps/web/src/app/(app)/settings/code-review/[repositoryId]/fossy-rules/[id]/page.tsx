import { redirect } from "next/navigation";
import {
    getAllOrganizationFossyRules,
    getInheritedFossyRules,
    getFossyRulesByRepositoryId,
} from "@services/fossyRules/fetch";
import { resolveFossyRuleById } from "src/core/utils/fossy-rules/resolve-rule";
import { addSearchParamsToUrl } from "src/core/utils/url";

import { FossyRuleModalClient } from "./modal-client";

export default async function FossyRuleDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ repositoryId: string; id: string }>;
    searchParams: Promise<{
        directoryId?: string;
        teamId?: string;
        tab?: "review-rules" | "memories" | "configuration";
    }>;
}) {
    try {
        // Await params first (Next.js 15 requirement)
        const { repositoryId, id } = await params;
        const { directoryId, teamId, tab } = await searchParams;

        const rule = await resolveFossyRuleById(
            id,
            { repositoryId, directoryId, teamId },
            {
                byRepo: (repoId, dirId) =>
                    getFossyRulesByRepositoryId(repoId, dirId),
                inherited: (p) => getInheritedFossyRules(p),
                all: () => getAllOrganizationFossyRules(),
            },
        );

        if (!rule) {
            const url = addSearchParamsToUrl(
                `/settings/code-review/${repositoryId}/fossy-rules`,
                { directoryId, tab },
            );
            redirect(url);
        }

        return (
            <FossyRuleModalClient
                rule={rule as any}
                repositoryId={repositoryId}
                directoryId={directoryId}
            />
        );
    } catch (error) {
        console.error("Error loading rule:", error);
        redirect("/settings/code-review");
    }
}
