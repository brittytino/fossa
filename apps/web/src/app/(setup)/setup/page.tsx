"use client";

import { redirect } from "next/navigation";
import { getCookie } from "cookies-next/client";
import { useAuth } from "src/core/providers/auth.provider";

import { getSetupCookieName } from "./_components/setup-step-tracker";
import { getStepByPath, SETUP_STEPS } from "./_config/setup-steps";

export default function Setup() {
    const { userId } = useAuth();

    if (userId === undefined) {
        return null;
    }

    if (userId) {
        const lastStep = getCookie(getSetupCookieName(userId)) as
            | string
            | undefined;
        const isValidLastStep = lastStep && getStepByPath(lastStep);

        if (isValidLastStep) {
            redirect(lastStep);
        }
    }

    redirect(SETUP_STEPS[0].path);
}
