"use client";

import React from "react";

export const MCPPluginsLimitPopover = ({
    children,
}: {
    limit?: number;
    children: React.ReactNode;
}) => {
    // In FOSSA open-source, plugins and MCPs are 100% free and unlimited
    return <>{children}</>;
};
