"use client";

import { Button } from "@components/ui/button";
import { CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { Link } from "@components/ui/link";
import { Switch } from "@components/ui/switch";
import { Controller, useFormContext } from "react-hook-form";
import { OverrideIndicatorForm } from "src/app/(app)/settings/code-review/_components/override";
import { addSearchParamsToUrl } from "src/core/utils/url";

import { CodeReviewFormType, FormattedConfigLevel } from "../../../_types";
import {
    useCodeReviewRouteParams,
    useCurrentConfigLevel,
} from "../../../../_hooks";

export const FossaConfigFileOverridesWebPreferences = () => {
    const form = useFormContext<CodeReviewFormType>();
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const currentLevel = useCurrentConfigLevel();

    const fossyRulesUrl = addSearchParamsToUrl(
        `/settings/code-review/${repositoryId}/fossy-rules`,
        { directoryId },
    );

    if (currentLevel === FormattedConfigLevel.GLOBAL) {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            <Controller
                name="fossaConfigFileOverridesWebPreferences.value"
                control={form.control}
                render={({ field }) => (
                    <Button
                        size="sm"
                        variant="helper"
                        disabled={field.disabled}
                        onClick={() => field.onChange(!field.value)}
                        className="w-full">
                        <CardHeader className="flex flex-row items-center justify-between gap-6">
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-row items-center gap-2">
                                    <Heading variant="h3">
                                        fossa Config File Overrides Web
                                        Preferences
                                    </Heading>

                                    <OverrideIndicatorForm fieldName="fossaConfigFileOverridesWebPreferences" />
                                </div>

                                <p className="text-text-secondary text-sm">
                                    When the <strong>fossa-config.yml </strong>{" "}
                                    is present in your{" "}
                                    {currentLevel ===
                                    FormattedConfigLevel.REPOSITORY
                                        ? "repo"
                                        : "directory"}
                                    , this property prioritizes settings in the
                                    fossaConfig file over web preferences. (this
                                    configuration can only be configured through
                                    the web interface and is not present in the
                                    configuration file)
                                </p>
                            </div>

                            <Switch decorative checked={field.value} />
                        </CardHeader>
                    </Button>
                )}
            />

            <p className="text-text-secondary text-xs">
                Note:{" "}
                <Link
                    href={fossyRulesUrl}
                    className="text-xs underline-offset-3">
                    Fossy Rules
                </Link>{" "}
                can only be configured through the web interface.
            </p>
        </div>
    );
};
