import { pathToApiUrl } from "src/core/utils/helpers";

export const GLOBAL_PARAMETERS_PATHS = {
    E2B_IP: pathToApiUrl("/parameters/e2b-ip"),
} as const;
