import { authorizedFetch } from "@services/fetch";

import { FOSSA_CREDITS_PATHS } from ".";
import type { FossaCreditCharge } from "./types";

export const listFossaCreditCharges = async (
    params: {
        limit?: number;
        before?: string;
        prNumber?: number;
    } = {},
) => {
    const response = await authorizedFetch<{ charges: FossaCreditCharge[] }>(
        FOSSA_CREDITS_PATHS.CHARGES,
        {
            cache: "no-store",
            params: {
                ...(params.limit ? { limit: params.limit } : {}),
                ...(params.before ? { before: params.before } : {}),
                ...(typeof params.prNumber === "number"
                    ? { prNumber: params.prNumber }
                    : {}),
            },
        },
    );
    return response?.charges ?? [];
};
