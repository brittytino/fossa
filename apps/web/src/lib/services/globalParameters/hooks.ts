import { useFetch } from "src/core/utils/reactQuery";

import { GLOBAL_PARAMETERS_PATHS } from ".";

export const useGetE2BIp = () => {
    return useFetch<{ ip: string | null }>(
        GLOBAL_PARAMETERS_PATHS.E2B_IP,
        undefined,
        true,
        {
            staleTime: 1000 * 60 * 60, // 1 hour
        },
    );
};
