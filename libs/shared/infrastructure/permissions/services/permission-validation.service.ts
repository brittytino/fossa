import { Inject, Injectable } from '@nestjs/common';
import { OrganizationAndTeamData } from '@libs/core/infrastructure/config/types/general/organizationAndTeamData';
import { OrganizationParametersKey } from '@libs/core/domain/enums';
import {
    IOrganizationParametersService,
    ORGANIZATION_PARAMETERS_SERVICE_TOKEN,
} from '@libs/organization/domain/organizationParameters/contracts/organizationParameters.service.contract';
import { createLogger } from '@libs/core/log/logger';
import {
    BYOKConfig,
    hasNonManagedCredential,
    LLM_TASK,
    LlmTask,
    NormalizedModel,
} from '@libs/llm/byok-config';
import { resolveTaskSlot as resolveTaskSlotFromConfig } from '@libs/llm/resolve-task-model';
import {
    resolveTaskInvocation as resolveTaskInvocationFromConfig,
    ResolveTaskInvocationOptions,
    TaskInvocation,
} from '@libs/llm/resolve-task-invocation';
import { RequestContext } from '@libs/llm/routing-strategy';
import { UserWithLicense } from '../interfaces/license.interface';

export enum PlanType {
    FREE = 'free',
    BYOK = 'byok',
    MANAGED = 'managed',
    TRIAL = 'trial',
}

export enum ValidationErrorType {
    INVALID_LICENSE = 'INVALID_LICENSE',
    USER_NOT_LICENSED = 'USER_NOT_LICENSED',
    BYOK_REQUIRED = 'BYOK_REQUIRED',
    PLAN_LIMIT_EXCEEDED = 'PLAN_LIMIT_EXCEEDED',
    CREDITS_EXHAUSTED = 'CREDITS_EXHAUSTED',
    NOT_ERROR = 'NOT_ERROR',
}

export class ValidationError extends Error {
    constructor(
        public type: ValidationErrorType,
        message: string,
        public metadata?: Record<string, any>,
    ) {
        super(message);
        this.name = 'ValidationError';
    }
}

export interface ValidationResult {
    allowed: boolean;
    byokConfig?: NormalizedModel | undefined;
    errorType?: ValidationErrorType;
    metadata?: Record<string, any>;
    subscriptionStatus?: string;
}

export type ExecutionPermissionValidationOptions = {
    consumeTrialReviewCredit?: boolean;
    trialReviewCreditUsageKey?: string;
    usersWithLicense?: UserWithLicense[];
};

@Injectable()
export class PermissionValidationService {
    private readonly logger = createLogger(PermissionValidationService.name);

    constructor(
        @Inject(ORGANIZATION_PARAMETERS_SERVICE_TOKEN)
        private readonly organizationParametersService: IOrganizationParametersService,
    ) {}

    async validateExecutionPermissions(
        organizationAndTeamData: OrganizationAndTeamData,
        _contextName?: string,
        _user?: any,
        _options: ExecutionPermissionValidationOptions = {},
    ): Promise<ValidationResult> {
        const slot = await this.resolveTaskSlot(
            organizationAndTeamData,
            LLM_TASK.codeReview,
        );

        return {
            allowed: true,
            byokConfig: slot,
            subscriptionStatus: 'active',
        };
    }

    async resolveTaskSlot(
        organizationAndTeamData: OrganizationAndTeamData,
        task: LlmTask,
        options: { ctx?: RequestContext } = {},
    ): Promise<NormalizedModel | undefined> {
        const rawConfig = await this.getBYOKConfig(organizationAndTeamData);
        const { slot } = resolveTaskSlotFromConfig(rawConfig, task, {
            ctx: options.ctx,
        });
        return slot;
    }

    async resolveTaskInvocation(
        organizationAndTeamData: OrganizationAndTeamData,
        task: LlmTask,
        options: ResolveTaskInvocationOptions,
    ): Promise<TaskInvocation> {
        const rawConfig = await this.getBYOKConfig(organizationAndTeamData);
        return resolveTaskInvocationFromConfig(rawConfig, task, options);
    }

    async hasBYOK(
        organizationAndTeamData: OrganizationAndTeamData,
    ): Promise<boolean> {
        const rawConfig = await this.getBYOKConfig(organizationAndTeamData);
        return hasNonManagedCredential(rawConfig);
    }

    async shouldLimitResources(
        _organizationAndTeamData: OrganizationAndTeamData,
        _contextName?: string,
    ): Promise<boolean> {
        // FOSSA is completely open source and self-hosted: never limit resources!
        return false;
    }

    async validateBasicLicense(
        _organizationAndTeamData: OrganizationAndTeamData,
    ): Promise<ValidationResult> {
        return {
            allowed: true,
            subscriptionStatus: 'active',
        };
    }

    async getBYOKConfig(
        organizationAndTeamData: OrganizationAndTeamData,
    ): Promise<BYOKConfig | undefined> {
        try {
            if (!organizationAndTeamData?.organizationId) {
                return undefined;
            }
            const parameter =
                await this.organizationParametersService.findByOrganizationIdAndKey(
                    organizationAndTeamData.organizationId,
                    OrganizationParametersKey.BYOK_CONFIG,
                );
            return parameter?.value as BYOKConfig | undefined;
        } catch (error) {
            this.logger.debug({
                message: 'Failed to retrieve byok_config parameter',
                metadata: { error: String(error) },
            });
            return undefined;
        }
    }

    async getSubscriptionStatus(
        _organizationAndTeamData: OrganizationAndTeamData,
    ): Promise<string> {
        return 'active';
    }

    async consumeTrialReviewCreditOnSuccess(
        _organizationAndTeamData: OrganizationAndTeamData,
        _usageKey?: string,
    ): Promise<void> {
        // No-op for FOSSA OSS
    }

    identifyPlanType(_plan?: string): PlanType {
        return PlanType.BYOK;
    }

    requiresBYOK(_planType?: PlanType): boolean {
        return false;
    }
}
