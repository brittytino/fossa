"use client";

import { useMemo } from "react";
import { useSubscriptionStatus } from "src/features/subscription/_hooks/use-subscription-status";

export const MCP_PLUGINS_FREE_LIMIT = Number.POSITIVE_INFINITY;

export const useMCPPluginsLimit = (installedCount: number) => {
    const subscription = useSubscriptionStatus();

    return useMemo(() => {
        return {
            total: installedCount,
            canInstallMore: true,
            limit: Number.POSITIVE_INFINITY,
            limited: false,
            plan: subscription.status,
        };
    }, [subscription, installedCount]);
};
