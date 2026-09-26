import React from "react";
import { SvgFossa } from "@components/ui/icons/SvgFossa";
import { Page } from "@components/ui/page";

export default function AuthPageHeader({
    children,
}: {
    children?: React.ReactNode;
}) {
    return (
        <Page.Header className="flex w-full flex-col items-center gap-10">
            <SvgFossa className="h-8" />
            {children}
        </Page.Header>
    );
}
