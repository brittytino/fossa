import { createLogger } from '@libs/core/log/logger';
import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { FinishOnboardingDTO } from '@libs/platform/dtos/finish-onboarding.dto';

import { ParametersKey } from '@libs/core/domain/enums/parameters-key.enum';
import {
    IParametersService,
    PARAMETERS_SERVICE_TOKEN,
} from '@libs/organization/domain/parameters/contracts/parameters.service.contract';
import {
    ITeamService,
    TEAM_SERVICE_TOKEN,
} from '@libs/organization/domain/team/contracts/team.service.contract';
import {
    IOrganizationService,
    ORGANIZATION_SERVICE_TOKEN,
} from '@libs/organization/domain/organization/contracts/organization.service.contract';

import { CreatePRCodeReviewUseCase } from './create-prs-code-review.use-case';
import { SyncSelectedRepositoriesFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/sync-selected-repositories.use-case';
import { GenerateFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/generate-fossy-rules.use-case';
import { CreateOrUpdateParametersUseCase } from '@libs/organization/application/use-cases/parameters/create-or-update-use-case';
import { TelemetryService } from '@libs/telemetry/application/services/telemetry.service';
import { CodeManagementService } from '@libs/platform/infrastructure/adapters/services/codeManagement.service';

@Injectable()
export class FinishOnboardingUseCase {
    private readonly logger = createLogger(FinishOnboardingUseCase.name);
    constructor(
        @Inject(PARAMETERS_SERVICE_TOKEN)
        private readonly parametersService: IParametersService,
        @Inject(TEAM_SERVICE_TOKEN)
        private readonly teamService: ITeamService,
        @Inject(ORGANIZATION_SERVICE_TOKEN)
        private readonly organizationService: IOrganizationService,
        private readonly reviewPRUseCase: CreatePRCodeReviewUseCase,
        @Inject(REQUEST)
        private readonly request: Request & {
            user: {
                organization: { uuid: string };
                uuid?: string;
                email?: string;
            };
        },
        private readonly syncSelectedReposFossyRulesUseCase: SyncSelectedRepositoriesFossyRulesUseCase,
        private readonly createOrUpdateParametersUseCase: CreateOrUpdateParametersUseCase,
        private readonly telemetry: TelemetryService,
        private readonly codeManagement: CodeManagementService,
        private readonly generateFossyRulesUseCase: GenerateFossyRulesUseCase,
    ) {}

    async execute(params: FinishOnboardingDTO) {
        let platformConfig;

        try {
            if (!this.request?.user?.organization?.uuid) {
                throw new Error('Organization ID not found');
            }

            const {
                teamId,
                reviewPR,
                pullNumber,
                repositoryName,
                repositoryId,
            } = params;

            const organizationId = this.request.user.organization.uuid;

            // [TIMING:onboarding] Provider-comparative instrumentation —
            // bitbucket finish-onboarding was observed far slower than
            // github/gitlab; the per-step breakdown isolates the slow path
            // (now `syncSelectedReposFossyRulesUseCase` provider tree reads).
            // Logs land in the api container so a single tail can isolate it.
            const __onboardingT0 = Date.now();
            const __mark = (
                label: string,
                start: number,
                extra: Record<string, unknown> = {},
            ) => {
                // console.log directly so the line survives whatever
                // structured-logger level filtering the framework
                // applies in production builds (which silently dropped
                // the first attempt that used this.logger.log).
                console.log(
                    `[TIMING:onboarding] ${label} took ${Date.now() - start}ms`,
                    JSON.stringify({
                        teamId,
                        step: label,
                        durationMs: Date.now() - start,
                        ...extra,
                    }),
                );
            };

            let __t = Date.now();
            platformConfig = await this.parametersService.findByKey(
                ParametersKey.PLATFORM_CONFIGS,
                { organizationId, teamId },
            );
            __mark('findByKey:PLATFORM_CONFIGS', __t);

            if (!platformConfig || !platformConfig.configValue) {
                throw new Error('Platform config not found');
            }

            __t = Date.now();
            await this.createOrUpdateParametersUseCase.execute(
                ParametersKey.PLATFORM_CONFIGS,
                {
                    ...platformConfig.configValue,
                    finishOnboard: true,
                },
                { organizationId, teamId },
            );
            __mark('createOrUpdate:PLATFORM_CONFIGS', __t);

            // Repo-file rule import + past-reviews rule generation both run
            // DETACHED after the onboarding response is sent. The repo-file sync
            // used to be awaited here on the assumption it was "fast, no LLM",
            // but it now converts rule files via the LLM (fast-batch + per-file
            // fallback) and takes minutes — long enough to blow past the gateway
            // timeout and 504 the finish-onboarding request. Detaching keeps
            // onboarding snappy; the FossyLearning cron's staleness recovery
            // covers runs that die mid-flight, and generated rules go through the
            // unified approval policy. Sync runs first (generation is chained off
            // its .finally) so generation sees the imported rules — preserving
            // the previous sequential ordering, just off the request path.
            setImmediate(() => {
                this.syncSelectedReposFossyRulesUseCase
                    // Pass organizationId explicitly: this runs after the HTTP
                    // response, so the sync use-case can no longer resolve it
                    // from the (possibly disposed) request scope.
                    .execute({ teamId, organizationId })
                    .catch((error) => {
                        this.logger.error({
                            message:
                                'Background Fossy Rules sync from repo files failed after onboarding',
                            context: FinishOnboardingUseCase.name,
                            error:
                                error instanceof Error
                                    ? error
                                    : new Error(String(error)),
                            metadata: { organizationId, teamId },
                        });
                    })
                    .finally(() => {
                        this.generateFossyRulesUseCase
                            .execute({ teamId, months: 3 }, organizationId)
                            .catch((error) => {
                                this.logger.error({
                                    message:
                                        'Background Fossy Rules generation failed after onboarding',
                                    context: FinishOnboardingUseCase.name,
                                    error:
                                        error instanceof Error
                                            ? error
                                            : new Error(String(error)),
                                    metadata: { organizationId, teamId },
                                });
                            });
                    });
            });

            __mark('TOTAL', __onboardingT0);

            if (reviewPR) {
                if (!pullNumber || !repositoryName || !repositoryId) {
                    throw new Error('Invalid PR data');
                }

                await this.reviewPRUseCase.execute({
                    teamId,
                    payload: {
                        id: repositoryId,
                        repository: repositoryName,
                        pull_number: pullNumber,
                    },
                });
            }

            const userId = this.request?.user?.uuid;
            const userEmail = this.request?.user?.email;
            if (userId) {
                // Best-effort hydration for human-readable names in telemetry
                // (Discord/Slack messages). If the lookup fails, telemetry
                // still fires with just the IDs — `safeCall` covers it.
                let teamName: string | undefined;
                let organizationName: string | undefined;
                try {
                    const team = await this.teamService.findById(teamId);
                    teamName = team?.name;
                    organizationName = team?.organization?.name;
                } catch (error) {
                    this.logger.warn({
                        message:
                            'Failed to resolve team/org names for onboarding telemetry; falling back to IDs only',
                        context: FinishOnboardingUseCase.name,
                        metadata: {
                            teamId,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : String(error),
                        },
                    });
                }

                // Real engineering team size from the just-connected git org.
                // Best-effort lead-scoring signal for the onboarding Discord
                // card — never blocks onboarding if the git lookup fails.
                //
                // MUST be time-bounded: the try/catch only covers rejections,
                // not hangs. When the git provider is rate-limited, octokit's
                // throttling plugin parks the request until the quota resets
                // (up to ~1h) — and this await held the entire
                // finish-onboarding response hostage to a Discord-card member
                // count (observed live: client retried the POST 6× at ~6min
                // each while the server "worked" on telemetry). 10s is
                // generous for a healthy member list; past that, ship the
                // telemetry without the count.
                let orgMemberCount: number | undefined;
                try {
                    let timeoutHandle: NodeJS.Timeout | undefined;
                    const members = await Promise.race([
                        this.codeManagement.getListMembers({
                            organizationAndTeamData: { organizationId, teamId },
                        }),
                        new Promise<never>((_, reject) => {
                            timeoutHandle = setTimeout(
                                () =>
                                    reject(
                                        new Error(
                                            'getListMembers timed out after 10s (time-bounded telemetry; likely provider rate-limit throttling)',
                                        ),
                                    ),
                                10_000,
                            );
                            timeoutHandle.unref?.();
                        }),
                    ]).finally(() => clearTimeout(timeoutHandle));
                    orgMemberCount = Array.isArray(members)
                        ? members.length
                        : undefined;

                    if (orgMemberCount !== undefined) {
                        await this.organizationService.update(
                            { uuid: organizationId },
                            {
                                codeHostMemberCount: orgMemberCount,
                                codeHostMemberCountUpdatedAt: new Date(),
                            },
                        );
                    }
                } catch (error) {
                    this.logger.warn({
                        message:
                            'Failed to resolve or persist org member count during onboarding',
                        context: FinishOnboardingUseCase.name,
                        metadata: {
                            teamId,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : String(error),
                        },
                    });
                }

                void this.telemetry.onboardingCompleted({
                    userId,
                    email: userEmail,
                    organizationId,
                    organizationName,
                    teamId,
                    teamName,
                    reviewedPR: !!reviewPR,
                    orgMemberCount,
                });

                if (reviewPR) {
                    void this.telemetry.onboardingReviewTriggered({
                        userId,
                        email: userEmail,
                        teamId,
                        organizationId,
                        repositoryId,
                    });
                } else {
                    void this.telemetry.onboardingReviewSkipped({
                        userId,
                        email: userEmail,
                        teamId,
                        organizationId,
                    });
                }
            }
        } catch (error) {
            this.logger.error({
                message: 'Error on OnboardingReviewPRUseCase',
                context: FinishOnboardingUseCase.name,
                error,
                metadata: params,
            });

            throw error;
        }
    }
}

