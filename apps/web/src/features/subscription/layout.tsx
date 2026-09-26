"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { Input } from "@components/ui/input";
import { magicModal } from "@components/ui/magic-modal";
import { Page } from "@components/ui/page";
import { Spinner } from "@components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import { PlusIcon, SearchIcon } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { isSelfHosted } from "src/core/utils/self-hosted";

import { InviteModal } from "./_components/invite-modal";
import { LicenseKeySettings } from "./_components/license-key-settings";
import { useSubscriptionStatus } from "./_hooks/use-subscription-status";
import { TableFilterContext } from "./_providers/table-filter-context";

const tabs = {
    prs: "pr-licenses",
    admins: "organization-admins",
} as const;

export default function SubscriptionLayout({
    status,
    admins,
    licenses,
}: {
    admins: React.ReactNode;
    status: React.ReactNode;
    licenses: React.ReactNode;
}) {
    const searchParams = useSearchParams();
    const [selectedTab, setSelectedTab] = useState<string>(
        tabs[searchParams.get("tab") as keyof typeof tabs] ?? tabs.prs,
    );
    const [query, setQuery] = useState("");
    const { teamId } = useSelectedTeamId();
    const canCreate = usePermission(Action.Create, ResourceType.UserSettings);
    const subscription = useSubscriptionStatus();

    const isLicensedSelfHosted =
        isSelfHosted && subscription.status === "licensed-self-hosted";
    const isUnlicensedSelfHosted =
        isSelfHosted && subscription.status === "self-hosted";

    // Self-hosted: completely free and open-source, no license key or selling needed
    if (isSelfHosted)
        return (
            <Page.Root>
                <Page.Content>
                    <Card
                        color="lv1"
                        className="mx-auto flex max-w-2xl flex-col items-center gap-4 p-8 text-center">
                        <Heading variant="h2">100% Free &amp; Open Source</Heading>
                        <p className="text-text-secondary text-sm">
                            FOSSA is completely free, self-hosted, and open-source under AGPL-3.0.
                            There are no paid plans, subscriptions, or license keys required.
                            Every feature is fully unlocked for your organization.
                        </p>
                        <div className="pt-2">
                            <Button
                                variant="primary"
                                onClick={() => (window.location.href = "/byok")}>
                                Manage AI Models &amp; BYOK
                            </Button>
                        </div>
                    </Card>
                </Page.Content>
            </Page.Root>
        );

    // Licensed self-hosted: show license settings + seat management tabs
    if (isLicensedSelfHosted)
        return (
            <Page.Root>
                <Page.Content>
                    <LicenseKeySettings />

                    <TableFilterContext value={{ query, setQuery }}>
                        <Tabs
                            value={selectedTab}
                            onValueChange={setSelectedTab}>
                            <TabsList className="mt-5">
                                <TabsTrigger value={tabs.prs}>
                                    PR licenses
                                </TabsTrigger>
                                <TabsTrigger value={tabs.admins}>
                                    Workspace members
                                </TabsTrigger>

                                <div className="mb-5 flex h-full flex-1 items-center justify-end">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            size="md"
                                            value={query}
                                            className="w-52"
                                            leftIcon={<SearchIcon />}
                                            placeholder="Find by name"
                                            onChange={(e) =>
                                                setQuery(e.target.value)
                                            }
                                        />

                                        {selectedTab === tabs.admins && (
                                            <Button
                                                size="md"
                                                variant="helper"
                                                leftIcon={<PlusIcon />}
                                                disabled={!canCreate}
                                                onClick={() => {
                                                    magicModal.show(() => (
                                                        <InviteModal
                                                            teamId={teamId}
                                                        />
                                                    ));
                                                }}>
                                                Invite member
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </TabsList>

                            <TabsContent value={tabs.prs}>
                                <Suspense
                                    fallback={
                                        <Card className="flex h-40 flex-col items-center justify-center gap-3 bg-transparent shadow-none">
                                            <Spinner />
                                            <p className="text-sm">
                                                Loading users...
                                            </p>
                                        </Card>
                                    }>
                                    {licenses}
                                </Suspense>
                            </TabsContent>

                            <Suspense>
                                <TabsContent value={tabs.admins}>
                                    {admins}
                                </TabsContent>
                            </Suspense>
                        </Tabs>
                    </TableFilterContext>
                </Page.Content>
            </Page.Root>
        );

    // Cloud mode: show standard subscription UI
    return (
        <Page.Root>
            <Page.Header>{status}</Page.Header>

            <Page.Content>
                <TableFilterContext value={{ query, setQuery }}>
                    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                        <TabsList className="mt-5">
                            <TabsTrigger value={tabs.prs}>
                                PR licenses
                            </TabsTrigger>
                            <TabsTrigger value={tabs.admins}>
                                Workspace members
                            </TabsTrigger>

                            <div className="mb-5 flex h-full flex-1 items-center justify-end">
                                <div className="flex items-center gap-2">
                                    <Input
                                        size="md"
                                        value={query}
                                        className="w-52"
                                        leftIcon={<SearchIcon />}
                                        placeholder="Find by name"
                                        onChange={(e) =>
                                            setQuery(e.target.value)
                                        }
                                    />

                                    {selectedTab === tabs.admins && (
                                        <Button
                                            size="md"
                                            variant="helper"
                                            leftIcon={<PlusIcon />}
                                            disabled={!canCreate}
                                            onClick={() => {
                                                magicModal.show(() => (
                                                    <InviteModal
                                                        teamId={teamId}
                                                    />
                                                ));
                                            }}>
                                            Invite member
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </TabsList>

                        <TabsContent value={tabs.prs}>
                            <Suspense
                                fallback={
                                    <Card className="flex h-40 flex-col items-center justify-center gap-3 bg-transparent shadow-none">
                                        <Spinner />
                                        <p className="text-sm">
                                            Loading users...
                                        </p>
                                    </Card>
                                }>
                                {licenses}
                            </Suspense>
                        </TabsContent>

                        <Suspense>
                            <TabsContent value={tabs.admins}>
                                {admins}
                            </TabsContent>
                        </Suspense>
                    </Tabs>
                </TableFilterContext>
            </Page.Content>
        </Page.Root>
    );
}
