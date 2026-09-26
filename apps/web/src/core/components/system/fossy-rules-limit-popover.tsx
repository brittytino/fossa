"use client";

import React from "react";

export const FossyRulesLimitPopover = ({
    children,
}: {
    limit?: number;
    children: React.ReactNode;
}) => {
    // In FOSSA open-source, all rules are unlimited with no caps or gating
    return <>{children}</>;
};
