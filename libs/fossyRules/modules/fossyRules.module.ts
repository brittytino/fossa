import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmailModule } from '@libs/common/email/email.module';
import { CodebaseModule } from '@libs/code-review/modules/codebase.module';
import { ContextReferenceModule } from '@libs/code-review/modules/contextReference.module';
import { PromptsModule } from '@libs/code-review/modules/prompts.module';
import { PullRequestsModule } from '@libs/code-review/modules/pull-requests.module';
import { GlobalCacheModule } from '@libs/core/cache/cache.module';
import { FossyRulesRepository } from '../infrastructure/adapters/repositories/fossyRules.repository';
import { FossyRulesValidationService } from '../infrastructure/adapters/services/fossy-rules-validation.service';
import { FossyRulesService } from '../infrastructure/adapters/services/fossyRules.service';
import { FossyRuleDetectorCompilerService } from '../infrastructure/adapters/services/fossy-rule-detector-compiler.service';
import { FOSSY_RULE_DETECTOR_COMPILER_TOKEN } from '../domain/contracts/fossy-rule-detector-compiler.contract';
import { PermissionValidationModule } from '@libs/shared/infrastructure/permissions';

import { UserModule } from '@libs/identity/modules/user.module';
import { IntegrationConfigModule } from '@libs/integrations/modules/config.module';
import { IntegrationModule } from '@libs/integrations/modules/integrations.module';
import { OrganizationModule } from '@libs/organization/modules/organization.module';
import { OrganizationParametersModule } from '@libs/organization/modules/organizationParameters.module';
import { ParametersModule } from '@libs/organization/modules/parameters.module';
import { PlatformCoreModule } from '@libs/platform/modules/platform-core.module';
import { AddLibraryFossyRulesUseCase } from '../application/use-cases/add-library-fossy-rules.use-case';
import { ApplyPendingFossyRulesUseCase } from '../application/use-cases/apply-pending-fossy-rules.use-case';
import { ChangeStatusFossyRulesUseCase } from '../application/use-cases/change-status-fossy-rules.use-case';
import { CheckSyncStatusUseCase } from '../application/use-cases/check-sync-status.use-case';
import { SyncRulesOnPlanChangeUseCase } from '../application/use-cases/sync-rules-on-plan-change.use-case';
import { ListPastReviewersUseCase } from '../application/use-cases/list-past-reviewers.use-case';
import { ConvertPendingUpdatesToNewUseCase } from '../application/use-cases/convert-pending-updates-to-new.use-case';
import { CreateOrUpdateFossyRulesUseCase } from '../application/use-cases/create-or-update.use-case';
import { BackfillRuleDetectorsUseCase } from '../application/use-cases/backfill-rule-detectors.use-case';
import { FossyRuleDetectorSweepService } from '../infrastructure/adapters/services/fossy-rule-detector-sweep.service';
import { DeleteRuleInOrganizationByIdFossyRulesUseCase } from '../application/use-cases/delete-rule-in-organization-by-id.use-case';
import { FastSyncIdeRulesUseCase } from '../application/use-cases/fast-sync-ide-rules.use-case';
import { FindByOrganizationIdFossyRulesUseCase } from '../application/use-cases/find-by-organization-id.use-case';
import { FindLibraryFossyRulesBucketsUseCase } from '../application/use-cases/find-library-fossy-rules-buckets.use-case';
import { FindLibraryFossyRulesWithFeedbackUseCase } from '../application/use-cases/find-library-fossy-rules-with-feedback.use-case';
import { FindLibraryFossyRulesUseCase } from '../application/use-cases/find-library-fossy-rules.use-case';
import { FindRecommendedFossyRulesUseCase } from '../application/use-cases/find-recommended-fossy-rules.use-case'; // Added
import { CountRulesByRepositoryUseCase } from '../application/use-cases/count-rules-by-repository.use-case';
import { FindRulesInOrganizationByRuleFilterFossyRulesUseCase } from '../application/use-cases/find-rules-in-organization-by-filter.use-case';
import { GetPendingFossyRulesUseCase } from '../application/use-cases/get-pending-fossy-rules.use-case';
import { FindSuggestionsByRuleUseCase } from '../application/use-cases/find-suggestions-by-rule.use-case';
import { GenerateFossyRulesUseCase } from '../application/use-cases/generate-fossy-rules.use-case';
import { GenerateInitialFossyRulesUseCase } from '../application/use-cases/generate-initial-fossy-rules.use-case';
import { GetInheritedRulesFossyRulesUseCase } from '../application/use-cases/get-inherited-fossy-rules.use-case';
import { GetRulesLimitStatusUseCase } from '../application/use-cases/get-rules-limit-status.use-case';
import { ImportFastFossyRulesUseCase } from '../application/use-cases/import-fast-fossy-rules.use-case';
import { ManageImportedFossyRulesUseCase } from '../application/use-cases/manage-imported-fossy-rules.use-case';
import { ResyncRulesFromIdeUseCase } from '../application/use-cases/resync-rules-from-ide.use-case';
import { ValidateRuleFileReferencesUseCase } from '../application/use-cases/validate-rule-file-references.use-case';
import { RemoveRuleLikeUseCase } from '../application/use-cases/rule-like/remove-rule-like.use-case';
import { SetRuleLikeUseCase } from '../application/use-cases/rule-like/set-rule-like.use-case';
import { SendRulesNotificationUseCase } from '../application/use-cases/send-rules-notification.use-case';
import { SyncSelectedRepositoriesFossyRulesUseCase } from '../application/use-cases/sync-selected-repositories.use-case';
import { GetGlobalRulesSourceRepositoriesUseCase } from '../application/use-cases/get-global-rules-source-repositories.use-case';
import { UpdateGlobalRulesSourceRepositoriesUseCase } from '../application/use-cases/update-global-rules-source-repositories.use-case';
import { ResyncGlobalRulesUseCase } from '../application/use-cases/resync-global-rules.use-case';
import { GetGlobalRulesImportStatusUseCase } from '../application/use-cases/get-global-rules-import-status.use-case';
import { FOSSY_RULES_REPOSITORY_TOKEN } from '../domain/contracts/fossyRules.repository.contract';
import { FOSSY_RULES_SERVICE_TOKEN } from '../domain/contracts/fossyRules.service.contract';
import {
    FossyRulesModel,
    FossyRulesSchema,
} from '../infrastructure/adapters/repositories/schemas/fossyRules.model';
import { ExternalReferenceLoaderService } from '../infrastructure/adapters/services/externalReferenceLoader.service';
import { FossyRulesSyncService } from '../infrastructure/adapters/services/fossyRulesSync.service';
import { FossyRuleSummaryService } from '../infrastructure/adapters/services/fossy-rule-summary.service';
import { RuleLikeModule } from './ruleLike.module';

import { PermissionsModule } from '@libs/identity/modules/permissions.module';
import { McpCoreModule } from '@libs/mcp-server/mcp-core.module';
import { FossyRulesSyncListener } from '../infrastructure/adapters/listeners/fossy-rules-sync.listener';
import { CodeReviewConfigurationModule } from '@libs/code-review/modules/code-review-configuration.module';
import { CentralizedConfigModule } from '@libs/centralized-config/modules/centralized-config.module';
import { NotificationModule } from '@libs/notifications/modules/notification.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: FossyRulesModel.name,
                schema: FossyRulesSchema,
            },
        ]),
        forwardRef(() => PlatformCoreModule),
        forwardRef(() => CodebaseModule),
        forwardRef(() => IntegrationConfigModule),
        forwardRef(() => IntegrationModule),
        forwardRef(() => ParametersModule),
        forwardRef(() => UserModule),
        forwardRef(() => OrganizationModule),
        forwardRef(() => OrganizationParametersModule),
        forwardRef(() => RuleLikeModule),
        forwardRef(() => PullRequestsModule),
        forwardRef(() => PromptsModule),
        forwardRef(() => ContextReferenceModule),
        GlobalCacheModule,
        forwardRef(() => PermissionValidationModule),
        PermissionsModule,
        forwardRef(() => McpCoreModule),
        forwardRef(() => CodeReviewConfigurationModule),
        forwardRef(() => CentralizedConfigModule),
        EmailModule,
        forwardRef(() => NotificationModule),
    ],
    providers: [
        {
            provide: FOSSY_RULES_REPOSITORY_TOKEN,
            useClass: FossyRulesRepository,
        },
        {
            provide: FOSSY_RULES_SERVICE_TOKEN,
            useClass: FossyRulesService,
        },
        GenerateFossyRulesUseCase,
        GenerateInitialFossyRulesUseCase,
        ApplyPendingFossyRulesUseCase,
        FindByOrganizationIdFossyRulesUseCase,
        FindRulesInOrganizationByRuleFilterFossyRulesUseCase,
        GetPendingFossyRulesUseCase,
        CountRulesByRepositoryUseCase,
        ChangeStatusFossyRulesUseCase,
        CreateOrUpdateFossyRulesUseCase,
        FossyRuleDetectorCompilerService,
        {
            provide: FOSSY_RULE_DETECTOR_COMPILER_TOKEN,
            useExisting: FossyRuleDetectorCompilerService,
        },
        BackfillRuleDetectorsUseCase,
        FossyRuleDetectorSweepService,
        SendRulesNotificationUseCase,
        SyncSelectedRepositoriesFossyRulesUseCase,
        GetGlobalRulesSourceRepositoriesUseCase,
        UpdateGlobalRulesSourceRepositoriesUseCase,
        ResyncGlobalRulesUseCase,
        GetGlobalRulesImportStatusUseCase,
        FossyRulesValidationService,
        FossyRulesSyncService,
        FossyRuleSummaryService,
        ExternalReferenceLoaderService,
        AddLibraryFossyRulesUseCase,
        CheckSyncStatusUseCase,
        SyncRulesOnPlanChangeUseCase,
        ListPastReviewersUseCase,
        DeleteRuleInOrganizationByIdFossyRulesUseCase,
        FastSyncIdeRulesUseCase,
        FindLibraryFossyRulesBucketsUseCase,
        FindLibraryFossyRulesWithFeedbackUseCase,
        FindLibraryFossyRulesUseCase,
        FindSuggestionsByRuleUseCase,
        GetInheritedRulesFossyRulesUseCase,
        GetRulesLimitStatusUseCase,
        ImportFastFossyRulesUseCase,
        ResyncRulesFromIdeUseCase,
        ValidateRuleFileReferencesUseCase,
        RemoveRuleLikeUseCase,
        SetRuleLikeUseCase,
        FossyRulesSyncListener,
        FindRecommendedFossyRulesUseCase, // Added
        ConvertPendingUpdatesToNewUseCase,
        ManageImportedFossyRulesUseCase,
    ],
    exports: [
        FOSSY_RULES_REPOSITORY_TOKEN,
        FOSSY_RULES_SERVICE_TOKEN,
        GenerateFossyRulesUseCase,
        GenerateInitialFossyRulesUseCase,
        ApplyPendingFossyRulesUseCase,
        FindByOrganizationIdFossyRulesUseCase,
        FindRulesInOrganizationByRuleFilterFossyRulesUseCase,
        GetPendingFossyRulesUseCase,
        CountRulesByRepositoryUseCase,
        ChangeStatusFossyRulesUseCase,
        CreateOrUpdateFossyRulesUseCase,
        BackfillRuleDetectorsUseCase,
        SendRulesNotificationUseCase,
        FossyRulesValidationService,
        FossyRulesSyncService,
        FossyRuleSummaryService,
        ExternalReferenceLoaderService,
        SyncSelectedRepositoriesFossyRulesUseCase,
        GetGlobalRulesSourceRepositoriesUseCase,
        UpdateGlobalRulesSourceRepositoriesUseCase,
        ResyncGlobalRulesUseCase,
        GetGlobalRulesImportStatusUseCase,
        AddLibraryFossyRulesUseCase,
        CheckSyncStatusUseCase,
        SyncRulesOnPlanChangeUseCase,
        ListPastReviewersUseCase,
        DeleteRuleInOrganizationByIdFossyRulesUseCase,
        FastSyncIdeRulesUseCase,
        FindLibraryFossyRulesBucketsUseCase,
        FindLibraryFossyRulesWithFeedbackUseCase,
        FindLibraryFossyRulesUseCase,
        FindSuggestionsByRuleUseCase,
        GetInheritedRulesFossyRulesUseCase,
        GetRulesLimitStatusUseCase,
        ImportFastFossyRulesUseCase,
        ResyncRulesFromIdeUseCase,
        ValidateRuleFileReferencesUseCase,
        RemoveRuleLikeUseCase,
        SetRuleLikeUseCase,
        FindRecommendedFossyRulesUseCase, // Added
        ConvertPendingUpdatesToNewUseCase,
        ManageImportedFossyRulesUseCase,
    ],
})
export class FossyRulesModule {}
