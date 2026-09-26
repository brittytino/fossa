"use client";

import { createContext, useContext } from "react";
import type { AwaitedReturnType } from "src/core/types";
import { isSelfHosted } from "src/core/utils/self-hosted";

import type {
    getUsersWithLicense,
    validateOrganizationLicense,
} from "../_services/billing/fetch";

type License = {
    license: AwaitedReturnType<typeof validateOrganizationLicense>;
};
type UsersWithAssignedLicense = {
    usersWithAssignedLicense: AwaitedReturnType<typeof getUsersWithLicense>;
};
/** The org has a model routed by the Fossa provider ("Fossa as the
 *  provider"), so its prepaid-credit balance is load-bearing. Derived by the
 *  app layout from the LLM config status (local config is the source of
 *  truth, not billing). */
type FossaProviderFlag = { usesFossaProvider?: boolean };

const SubscriptionContext = createContext<
    License & UsersWithAssignedLicense & FossaProviderFlag
>({
    usersWithAssignedLicense: [],
    license: {
        valid: true,
        subscriptionStatus: "self-hosted",
    },
    usesFossaProvider: false,
});

export const useSubscriptionContext = () => {
    const context = useContext(SubscriptionContext);
    return context;
};

export const SubscriptionProvider = ({
    children,
    license,
    usersWithAssignedLicense,
    usesFossaProvider,
}: React.PropsWithChildren & {
    license: AwaitedReturnType<typeof validateOrganizationLicense>;
    usersWithAssignedLicense: AwaitedReturnType<typeof getUsersWithLicense>;
    usesFossaProvider?: boolean;
}) => {
    // Skip provider only for unlicensed self-hosted (uses context default)
    if (isSelfHosted && license.subscriptionStatus === "self-hosted") {
        return children;
    }

    return (
        <SubscriptionContext.Provider
            value={{
                license,
                usersWithAssignedLicense,
                usesFossaProvider: usesFossaProvider ?? false,
            }}>
            {children}
        </SubscriptionContext.Provider>
    );
};
