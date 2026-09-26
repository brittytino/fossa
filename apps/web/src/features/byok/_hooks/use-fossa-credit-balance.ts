"use client";

import { useQuery } from "@tanstack/react-query";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { getCreditBalanceAction } from "src/features/subscription/_actions/credits";
import { useFossaCredits } from "src/features/subscription/_hooks/use-fossa-credits";
import type {
    CreditAutoTopUp,
    CreditBalance,
} from "src/features/subscription/_services/billing/types";

/** Default commercial parameters until billing answers (mirrors the billing
 *  service's creditPricing config; only used to render, never to charge). */
const FALLBACK = {
    packsUsd: [20, 50, 100, 500],
    markupPct: 7,
    lowThresholdUsd: 5,
    minPurchaseUsd: 10,
    maxPurchaseUsd: 5000,
};

export type FossaCreditBalanceView = {
    /** The org routes at least one model through the Fossa provider. */
    usesFossaProvider: boolean;
    /** Live balance from billing, falling back to the license snapshot. */
    balanceUsd: number | undefined;
    /** Balance known and at or below zero. */
    exhausted: boolean;
    /** Balance known, positive, and at or below the low-balance threshold. */
    low: boolean;
    /** The org never bought credits: the balance is empty because nothing was
     *  ever added, not because it was spent. Drives the "add credits to start"
     *  framing instead of "used up". */
    neverFunded: boolean;
    autoTopUp: CreditAutoTopUp | null;
    /** Billing's answer, or null when it has none / is unreachable. */
    balance: CreditBalance | null | undefined;
    loading: boolean;
    packsUsd: number[];
    markupPct: number;
    minPurchaseUsd: number;
    maxPurchaseUsd: number;
    lowThresholdUsd: number;
};

/** Query key shared by every wallet surface (chip, provider card, wallet) so
 *  one invalidation after a top-up refreshes all of them. */
export const fossaCreditBalanceKey = (teamId: string | undefined) => [
    "fossa-credits",
    "balance",
    teamId,
];

/**
 * The single source of the prepaid balance for the app chrome. Renders from
 * the license snapshot immediately (no flash), then swaps in billing's live
 * number. Fetches only for orgs that route through Fossa — everyone else
 * pays nothing for this hook.
 */
export const useFossaCreditBalance = (): FossaCreditBalanceView => {
    const { teamId } = useSelectedTeamId();
    const credits = useFossaCredits();

    const query = useQuery<CreditBalance | null>({
        queryKey: fossaCreditBalanceKey(teamId),
        queryFn: () => getCreditBalanceAction({ teamId }),
        enabled: !!teamId && credits.usesFossaProvider,
        staleTime: 30_000,
    });

    const balance = query.data;
    const balanceUsd =
        typeof balance?.balanceUsd === "number"
            ? balance.balanceUsd
            : credits.balanceUsd;
    const lowThresholdUsd =
        balance?.lowThresholdUsd ?? FALLBACK.lowThresholdUsd;
    const known = typeof balanceUsd === "number";

    const exhausted = known && balanceUsd <= 0;
    return {
        usesFossaProvider: credits.usesFossaProvider,
        balanceUsd,
        exhausted,
        low: known && balanceUsd > 0 && balanceUsd <= lowThresholdUsd,
        neverFunded:
            exhausted && !!balance && balance.lifetimePurchasedUsd === 0,
        autoTopUp: balance?.autoTopUp ?? null,
        balance,
        loading: query.isLoading && !known,
        packsUsd: balance?.packsUsd ?? FALLBACK.packsUsd,
        markupPct: balance?.markupPct ?? FALLBACK.markupPct,
        minPurchaseUsd: balance?.minPurchaseUsd ?? FALLBACK.minPurchaseUsd,
        maxPurchaseUsd: balance?.maxPurchaseUsd ?? FALLBACK.maxPurchaseUsd,
        lowThresholdUsd,
    };
};

/** The wallet's home: the Fossa provider card on the BYOK page. */
export const FOSSA_CREDITS_PATH = "/byok#fossa";
