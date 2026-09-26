"use client";

import { Badge } from "@components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip";
import {
    CheckIcon,
    InfoIcon,
    Loader2Icon,
    TriangleAlertIcon,
} from "lucide-react";
import { cn } from "src/core/utils/components";

import { useCodeReviewRouteParams } from "../_hooks";
import { FossaConfigFileOverlayStatus } from "../code-review/_types";
import {
    useCodeReviewConfigFetchState,
    useFullCodeReviewConfig,
} from "./context";

export type FossaConfigFileStatusView =
    | { state: "hidden" }
    | { state: "loading" }
    | { state: "loaded" }
    | { state: "notFound" }
    | { state: "unavailable"; error?: string };

/**
 * Whether the current scope's `fossa-config.yml` made it into the config on
 * screen. Reading the file is a live git-provider call, so it can be missing
 * from an otherwise healthy response — and the settings screen would then show
 * configuration that differs from what a review actually applies. Anything but
 * "hidden" means the scope IS governed by a file, so the state has to be shown.
 */
export const useFossaConfigFileStatus = (): FossaConfigFileStatusView => {
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const config = useFullCodeReviewConfig();
    const { isFetching, isError } = useCodeReviewConfigFetchState();

    // The file lives in the repository, so it never applies to global settings.
    if (!repositoryId || repositoryId === "global") {
        return { state: "hidden" };
    }

    const repository = config?.repositories?.find(
        (repo) => repo.id === repositoryId,
    );

    if (!repository) {
        return { state: "hidden" };
    }

    const overlay = directoryId
        ? repository.directories?.find((dir) => dir.id === directoryId)
              ?.fossaConfigFile
        : repository.fossaConfigFile;

    // Absent on responses from an API that predates the field; DISABLED means
    // this scope does not read a file at all. Either way there is nothing to
    // tell the user.
    if (!overlay || overlay.status === FossaConfigFileOverlayStatus.DISABLED) {
        return { state: "hidden" };
    }

    if (overlay.status === FossaConfigFileOverlayStatus.LOADED) {
        return { state: "loaded" };
    }

    if (overlay.status === FossaConfigFileOverlayStatus.NOT_FOUND) {
        return { state: "notFound" };
    }

    if (overlay.status === FossaConfigFileOverlayStatus.UNAVAILABLE) {
        return { state: "unavailable", error: overlay.error };
    }

    // SKIPPED: the server render never asked for the overlay, so it is on its
    // way — unless the client request that carries it already failed.
    if (isError && !isFetching) {
        return { state: "unavailable" };
    }

    return { state: "loading" };
};

const views = {
    loading: {
        label: "Loading fossa-config.yml",
        description:
            "Reading fossa-config.yml from your repository. Values defined in the file are not applied to this page yet.",
        className:
            "bg-warning/10 text-warning ring-warning/64 [--button-foreground:var(--color-warning)]",
        icon: <Loader2Icon className="animate-spin" />,
    },
    loaded: {
        label: "fossa-config.yml applied",
        description:
            "Some of these settings come from the fossa-config.yml file in your repository, which overrides what is configured here.",
        className:
            "bg-success/10 text-success ring-success/64 [--button-foreground:var(--color-success)]",
        icon: <CheckIcon />,
    },
    notFound: {
        label: "fossa-config.yml not found",
        description:
            "This repository is set to be overridden by fossa-config.yml, but no file came back from your git provider. Either the file does not exist, or it exists and could not be read — the settings below come from what is stored here.",
        className:
            "bg-alert/10 text-alert ring-alert/64 [--button-foreground:var(--color-alert)]",
        icon: <InfoIcon />,
    },
    unavailable: {
        label: "fossa-config.yml unavailable",
        description:
            "This repository is configured to be overridden by fossa-config.yml, but the file could not be read from your git provider. The settings below come from what is stored here and may differ from what a review applies.",
        className:
            "bg-danger/10 text-danger ring-danger/64 [--button-foreground:var(--color-danger)]",
        icon: <TriangleAlertIcon />,
    },
} as const;

export const FossaConfigFileStatusBadge = () => {
    const status = useFossaConfigFileStatus();

    if (status.state === "hidden") {
        return null;
    }

    const view = views[status.state];

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge
                    leftIcon={view.icon}
                    className={cn(
                        "h-6 min-h-auto rounded-lg px-2 text-[10px] leading-px ring-1",
                        view.className,
                    )}>
                    {view.label}
                </Badge>
            </TooltipTrigger>

            <TooltipContent className="max-w-xs">
                {status.state === "unavailable" && status.error
                    ? `${view.description} (${status.error})`
                    : view.description}
            </TooltipContent>
        </Tooltip>
    );
};
