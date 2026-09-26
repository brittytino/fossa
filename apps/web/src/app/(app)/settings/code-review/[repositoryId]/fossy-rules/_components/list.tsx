"use client";

import {
    type FossyRule,
    type FossyRuleWithInheritanceDetails,
} from "@services/fossyRules/types";

import { FossyRuleItem } from "./item";

type FossyRulesListProps = {
    rules: FossyRule[];
    tab: "review-rules" | "memories";
    onAnyChange: () => void;
    showSuggestionsButton?: boolean;
    /** Optional bulk-selection wiring. When omitted the list renders
     *  without checkboxes. */
    bulkSelection?: {
        selection: ReadonlySet<string>;
        onToggle: (ruleId: string) => void;
        isEligible: (rule: FossyRuleWithInheritanceDetails) => boolean;
    };
    /** Repo's `ideRulesSyncEnabled`; forwarded to each row's OriginBadge. */
    syncEnabledForRepo?: boolean;
};

export const FossyRulesList = ({
    rules,
    tab,
    onAnyChange,
    bulkSelection,
    syncEnabledForRepo,
}: FossyRulesListProps) => {
    const entityLabel = tab === "memories" ? "memories" : "rules";

    if (rules.length === 0) {
        return (
            <div className="text-text-secondary flex flex-col items-center gap-2 py-20 text-sm">
                No {entityLabel} found with your current filters.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-2">
            {rules.map((rule) => {
                const selection =
                    bulkSelection && rule.uuid
                        ? {
                              isSelected: bulkSelection.selection.has(
                                  rule.uuid,
                              ),
                              eligible: bulkSelection.isEligible(
                                  rule as FossyRuleWithInheritanceDetails,
                              ),
                              onToggle: () =>
                                  bulkSelection.onToggle(rule.uuid as string),
                          }
                        : undefined;

                return (
                    <FossyRuleItem
                        key={rule.uuid}
                        rule={rule}
                        onAnyChange={onAnyChange}
                        showSuggestionsButton={tab === "review-rules"}
                        selection={selection}
                        syncEnabledForRepo={syncEnabledForRepo}
                    />
                );
            })}
        </div>
    );
};
