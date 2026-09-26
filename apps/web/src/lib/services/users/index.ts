import { pathToApiUrl } from "src/core/utils/helpers";

export const USERS_PATHS = {
    JOIN_ORGANIZATION: pathToApiUrl("/user/join-organization"),
    MARKETING_SURVEY: pathToApiUrl("/user/marketing-survey"),
} as const;
