import { pathToApiUrl } from "src/core/utils/helpers";

export const FOSSY_RULES_PATHS = {
    CREATE_OR_UPDATE: pathToApiUrl("/fossy-rules/create-or-update"),
    FIND_BY_ORGANIZATION_ID: pathToApiUrl(
        "/fossy-rules/find-by-organization-id",
    ),
    FIND_BY_ORGANIZATION_ID_AND_FILTER: pathToApiUrl(
        "/fossy-rules/find-rules-in-organization-by-filter",
    ),
    DELETE_BY_ORGANIZATION_ID_AND_ROLE_UUID: pathToApiUrl(
        "/fossy-rules/delete-rule-in-organization-by-id",
    ),
    FIND_LIBRARY_FOSSY_RULES: pathToApiUrl(
        "/fossy-rules/find-library-fossy-rules",
    ),
    FIND_LIBRARY_FOSSY_RULES_WITH_FEEDBACK: pathToApiUrl(
        "/fossy-rules/find-library-fossy-rules-with-feedback",
    ),
    FIND_LIBRARY_FOSSY_RULES_BUCKETS: pathToApiUrl(
        "/fossy-rules/find-library-fossy-rules-buckets",
    ),
    ADD_LIBRARY_FOSSY_RULES: pathToApiUrl("/fossy-rules/add-library-fossy-rules"),
    FAST_SYNC_IDE_RULES: pathToApiUrl("/fossy-rules/fast-sync-ide-rules"),
    PENDING_IDE_RULES: pathToApiUrl("/fossy-rules/pending-ide-rules"),
    REVIEW_FAST_IDE_RULES: pathToApiUrl("/fossy-rules/review-fast-ide-rules"),
    CHANGE_STATUS_FOSSY_RULES: pathToApiUrl(
        "/fossy-rules/change-status-fossy-rules",
    ),
    APPLY_PENDING_FOSSY_RULES: pathToApiUrl("/fossy-rules/pending/apply"),
    DISCARD_PENDING_FOSSY_RULES: pathToApiUrl("/fossy-rules/pending/discard"),
    CONVERT_PENDING_UPDATES_TO_NEW: pathToApiUrl(
        "/fossy-rules/pending/convert-updates-to-new",
    ),
    GENERATE_FOSSY_RULES: pathToApiUrl("/fossy-rules/generate-fossy-rules"),
    SYNC_IDE_RULES: pathToApiUrl("/fossy-rules/sync-ide-rules"),
    CHECK_SYNC_STATUS: pathToApiUrl("/fossy-rules/check-sync-status"),
    PAST_REVIEWERS: pathToApiUrl("/fossy-rules/past-reviewers"),
    GET_INHERITED_RULES: pathToApiUrl("/fossy-rules/inherited-rules"),
    GET_FOSSY_RULES_TOTAL_QUANTITY: pathToApiUrl("/fossy-rules/limits"),
    GET_FOSSY_RULE_SUGGESTIONS: pathToApiUrl("/fossy-rules/suggestions"),
    FIND_RECOMMENDED_FOSSY_RULES: pathToApiUrl(
        "/fossy-rules/find-recommended-fossy-rules",
    ),
    MANAGE_IMPORTED_FOSSY_RULES: pathToApiUrl("/fossy-rules/imported/manage"),
    COUNT_IMPORTED_FOSSY_RULES: pathToApiUrl("/fossy-rules/imported/count"),
    COUNTS_BY_REPOSITORY: pathToApiUrl("/fossy-rules/counts-by-repository"),
    GLOBAL_SOURCE_REPOSITORIES: pathToApiUrl(
        "/fossy-rules/global-source-repositories",
    ),
    GLOBAL_RULES_IMPORT_STATUS: pathToApiUrl(
        "/fossy-rules/global-source-repositories/import-status",
    ),
    RESYNC_GLOBAL_RULES: pathToApiUrl("/fossy-rules/resync-global-rules"),
} as const;
