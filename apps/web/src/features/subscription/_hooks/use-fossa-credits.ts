"use client";

import { useSubscriptionContext } from "../_providers/subscription-context";

export type FossaCreditsStatus = {
    /** The org routes at least one model through the Fossa provider. */
    usesFossaProvider: boolean;
    /** Balance from the license payload; undefined when billing has none. */
    balanceUsd?: number;
    /** Known balance at or below zero on an org that uses the provider —
     *  reviews on Fossa-routed models are blocked by the API gate. */
    exhausted: boolean;
};

/**
 * Prepaid-credit state as the app chrome sees it ("Fossa as the provider").
 * Mirrors the API gate: only a KNOWN non-positive balance counts as exhausted;
 * an absent number never raises a banner.
 */
export const useFossaCredits = (): FossaCreditsStatus => {
    const { license, usesFossaProvider } = useSubscriptionContext();
    const raw = (license as { creditBalanceUsd?: unknown })?.creditBalanceUsd;
    const balanceUsd =
        typeof raw === "number" && Number.isFinite(raw) ? raw : undefined;
    const uses = usesFossaProvider === true;
    return {
        usesFossaProvider: uses,
        balanceUsd,
        exhausted: uses && typeof balanceUsd === "number" && balanceUsd <= 0,
    };
};
