"use client";

import { Link } from "@components/ui/link";
import { useFeatureFlags } from "src/app/(app)/settings/_components/context";
import { useFossaCreditBalance } from "src/features/byok/_hooks/use-fossa-credit-balance";
import { useSubscriptionStatus } from "src/features/subscription/_hooks/use-subscription-status";

const TrialExpiring = () => {
    const subscriptionStatus = useSubscriptionStatus();
    const daysLeft =
        subscriptionStatus.status === "trial-expiring"
            ? subscriptionStatus.trialDaysLeft
            : 0;

    return (
        <div className="bg-danger/30 py-2 text-center text-sm">
            Your Team trial expires in {daysLeft} days.{" "}
            <Link href="/settings/subscription" className="font-bold">
                Upgrade
            </Link>{" "}
            to keep all features.
        </div>
    );
};

const TrialExhausted = () => {
    // Private alpha: the Fossa-credits path is offered only to orgs on the flag.
    const { fossaProvider } = useFeatureFlags();
    return (
        <div className="bg-danger/30 py-2 text-center text-sm">
            You've used all the free PR reviews included in your trial.{" "}
            {fossaProvider ? (
                <>
                    <Link
                        href="/byok/manual?provider=fossa"
                        className="font-bold">
                        Use Fossa credits
                    </Link>{" "}
                    (no API key) or{" "}
                    <Link href="/byok" className="font-bold">
                        connect your own AI key
                    </Link>{" "}
                </>
            ) : (
                <>
                    <Link href="/byok" className="font-bold">
                        Connect your own AI key
                    </Link>{" "}
                </>
            )}
            to keep Fossy reviewing — unlimited, on any plan.
        </div>
    );
};

const SubscriptionInvalid = () => {
    return (
        <div className="bg-danger/30 py-2 text-center text-sm">
            Fossy's off duty!{" "}
            <Link href="/settings/subscription" className="font-bold">
                Upgrade
            </Link>{" "}
            subscription to bring her back to work.
        </div>
    );
};

const components: Partial<
    Record<
        ReturnType<typeof useSubscriptionStatus>["status"],
        React.ComponentType
    >
> = {
    "trial-expiring": TrialExpiring,
    "trial-exhausted": TrialExhausted,
    "expired": SubscriptionInvalid,
    "canceled": SubscriptionInvalid,
    "payment-failed": SubscriptionInvalid,
};

const CreditsExhausted = ({ neverFunded }: { neverFunded: boolean }) => {
    if (neverFunded) {
        return (
            <div className="bg-warning/25 py-2 text-center text-sm">
                Your Fossa model has no credits yet — reviews won&apos;t run
                until you{" "}
                <Link href="/byok#fossa" className="font-bold">
                    add credits
                </Link>
                .
            </div>
        );
    }
    return (
        <div className="bg-danger/30 py-2 text-center text-sm">
            Your Fossa credits are used up — reviews on Fossa-routed models are
            paused.{" "}
            <Link href="/byok#fossa" className="font-bold">
                Top up credits
            </Link>{" "}
            or{" "}
            <Link href="/byok" className="font-bold">
                connect your own AI key
            </Link>
            .
        </div>
    );
};

export const SubscriptionStatusTopbar = () => {
    const { status } = useSubscriptionStatus();
    const credits = useFossaCreditBalance();
    const Component = components[status];

    // An exhausted prepaid balance blocks reviews regardless of the plan
    // state, so it shows alongside (above) the plan banner — an expired plan
    // is still expired. A never-funded org gets the "add credits to start"
    // framing rather than "used up".
    if (credits.usesFossaProvider && credits.exhausted) {
        return (
            <div>
                <CreditsExhausted neverFunded={credits.neverFunded} />
                {Component && <Component />}
            </div>
        );
    }

    if (!Component) return null;
    return (
        <div>
            <Component />
        </div>
    );
};
