/** One metered charge on a Fossa-routed model (API journal, not billing). */
export type FossaCreditCharge = {
    spanId: string;
    correlationId?: string;
    prNumber?: number;
    /** Catalog id, e.g. `anthropic/claude-sonnet-5`. */
    model: string;
    area?: string;
    route?: string;
    tokens: {
        input: number;
        output: number;
        reasoning: number;
        cacheRead: number;
        cacheWrite: number;
    };
    amountUsd: number;
    status: "pending" | "debited" | "unpriced" | "failed";
    spanAt: string;
    debitedAt?: string;
};
