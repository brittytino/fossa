import { AddLibraryFossyRulesUseCase } from './add-library-fossy-rules.use-case';
import { ApplyPendingFossyRulesUseCase } from './apply-pending-fossy-rules.use-case';
import { ChangeStatusFossyRulesUseCase } from './change-status-fossy-rules.use-case';
import { CheckSyncStatusUseCase } from './check-sync-status.use-case';
import { ListPastReviewersUseCase } from './list-past-reviewers.use-case';
import { ConvertPendingUpdatesToNewUseCase } from './convert-pending-updates-to-new.use-case';
import { CreateOrUpdateFossyRulesUseCase } from './create-or-update.use-case';
import { DeleteRuleInOrganizationByIdFossyRulesUseCase } from './delete-rule-in-organization-by-id.use-case';
import { FastSyncIdeRulesUseCase } from './fast-sync-ide-rules.use-case';
import { FindByOrganizationIdFossyRulesUseCase } from './find-by-organization-id.use-case';
import { FindLibraryFossyRulesBucketsUseCase } from './find-library-fossy-rules-buckets.use-case';
import { FindLibraryFossyRulesWithFeedbackUseCase } from './find-library-fossy-rules-with-feedback.use-case';
import { FindLibraryFossyRulesUseCase } from './find-library-fossy-rules.use-case';
import { FindRecommendedFossyRulesUseCase } from './find-recommended-fossy-rules.use-case';
import { FindRulesInOrganizationByRuleFilterFossyRulesUseCase } from './find-rules-in-organization-by-filter.use-case';
import { FindSuggestionsByRuleUseCase } from './find-suggestions-by-rule.use-case';
import { GenerateInitialFossyRulesUseCase } from './generate-initial-fossy-rules.use-case';
import { GenerateFossyRulesUseCase } from './generate-fossy-rules.use-case';
import { GetInheritedRulesFossyRulesUseCase } from './get-inherited-fossy-rules.use-case';
import { GetPendingFossyRulesUseCase } from './get-pending-fossy-rules.use-case';
import { GetRulesLimitStatusUseCase } from './get-rules-limit-status.use-case';
import { ImportFastFossyRulesUseCase } from './import-fast-fossy-rules.use-case';
import { ManageImportedFossyRulesUseCase } from './manage-imported-fossy-rules.use-case';
import { ResyncRulesFromIdeUseCase } from './resync-rules-from-ide.use-case';
import { SendRulesNotificationUseCase } from './send-rules-notification.use-case';
import { SyncSelectedRepositoriesFossyRulesUseCase } from './sync-selected-repositories.use-case';

export const UseCases = [
    CreateOrUpdateFossyRulesUseCase,
    FindByOrganizationIdFossyRulesUseCase,
    FindRulesInOrganizationByRuleFilterFossyRulesUseCase,
    DeleteRuleInOrganizationByIdFossyRulesUseCase,
    FindLibraryFossyRulesUseCase,
    FindLibraryFossyRulesWithFeedbackUseCase,
    FindLibraryFossyRulesBucketsUseCase,
    FindRecommendedFossyRulesUseCase,
    AddLibraryFossyRulesUseCase,
    ApplyPendingFossyRulesUseCase,
    GenerateFossyRulesUseCase,
    GenerateInitialFossyRulesUseCase,
    ChangeStatusFossyRulesUseCase,
    SendRulesNotificationUseCase,
    SyncSelectedRepositoriesFossyRulesUseCase,
    CheckSyncStatusUseCase,
    ListPastReviewersUseCase,
    GetInheritedRulesFossyRulesUseCase,
    GetPendingFossyRulesUseCase,
    GetRulesLimitStatusUseCase,
    FindSuggestionsByRuleUseCase,
    ResyncRulesFromIdeUseCase,
    FastSyncIdeRulesUseCase,
    ImportFastFossyRulesUseCase,
    ConvertPendingUpdatesToNewUseCase,
    ManageImportedFossyRulesUseCase,
];
