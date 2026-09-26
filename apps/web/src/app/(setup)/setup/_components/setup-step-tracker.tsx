"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { setCookie } from "cookies-next/client";
import { useAuth } from "src/core/providers/auth.provider";

import { getStepByPath } from "../_config/setup-steps";

export const SETUP_LAST_STEP_PREFIX = "setup-last-step";

export const getSetupCookieName = (userId: string) =>
    `${SETUP_LAST_STEP_PREFIX}-${userId}`;

export const SetupProgressSaver = () => {
    const pathname = usePathname();
    const { userId } = useAuth();

    useEffect(() => {
        if (!userId) return;

        const matchedStep = getStepByPath(pathname);

        if (matchedStep) {
            setCookie(getSetupCookieName(userId), matchedStep.path, {
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            });
        }
    }, [pathname, userId]);

    return null;
};
