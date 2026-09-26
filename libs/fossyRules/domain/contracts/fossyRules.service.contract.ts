import { UserInfo } from '@libs/core/infrastructure/config/types/general/codeReviewSettingsLog.type';
import {
    BucketInfo,
    FossyRuleFilters,
    LibraryFossyRule,
} from '@libs/core/infrastructure/config/types/general/fossyRules.type';
import { OrganizationAndTeamData } from '@libs/core/infrastructure/config/types/general/organizationAndTeamData';
import { CreateFossyRuleDto } from '../../dtos/create-fossy-rule.dto';
import { FossyRulesEntity } from '../entities/fossyRules.entity';
import {
    FindMemoriesFilters,
    FindMemoriesResult,
    IFossyRule,
    IFossyRuleContextNeed,
    IFossyRuleFileScope,
    IFossyRuleCompileAttempt,
    IFossyRuleDetector,
    IFossyRuleMemory,
    FossyRulesStatus,
} from '../interfaces/fossyRules.interface';
import { IFossyRulesRepository } from './fossyRules.repository.contract';

export const FOSSY_RULES_SERVICE_TOKEN = 'FOSSY_RULES_SERVICE_TOKEN';

export type MemoryCreationAction = 'created' | 'updated' | 'skipped';

export interface CreateOrUpdateMemoryResult {
    rule: Partial<IFossyRule> | IFossyRule;
    action: MemoryCreationAction;
    requiresApproval: boolean;
    link: string;
}

export interface IFossyRulesService extends IFossyRulesRepository {
    createOrUpdate(
        organizationAndTeamData: OrganizationAndTeamData,
        fossyRule: CreateFossyRuleDto,
        userInfo?: UserInfo,
    ): Promise<Partial<IFossyRule> | IFossyRule | null>;

    getLibraryFossyRules(
        filters?: FossyRuleFilters,
        userId?: string,
    ): Promise<LibraryFossyRule[]>;
    getLibraryFossyRulesWithFeedback(
        filters?: FossyRuleFilters,
        userId?: string,
    ): Promise<LibraryFossyRule[]>;

    getLibraryFossyRulesBuckets(): Promise<BucketInfo[]>;

    findRulesByDirectory(
        organizationId: string,
        repositoryId: string,
        directoryId: string,
    ): Promise<Partial<IFossyRule>[]>;
    updateRulesStatusByFilter(
        organizationId: string,
        repositoryId: string,
        directoryId?: string,
        newStatus?: FossyRulesStatus,
    ): Promise<FossyRulesEntity | null>;

    deleteRuleWithLogging(
        organizationAndTeamData: OrganizationAndTeamData,
        ruleId: string,
        userInfo: UserInfo,
    ): Promise<boolean>;

    updateRuleWithLogging(
        organizationAndTeamData: OrganizationAndTeamData,
        fossyRule: CreateFossyRuleDto,
        userInfo?: UserInfo,
    ): Promise<Partial<IFossyRule> | IFossyRule | null>;

    updateRuleReferences(
        organizationId: string,
        ruleId: string,
        references: {
            contextReferenceId?: string;
            // Todos os outros campos de referência foram movidos para Context OS
        },
    ): Promise<IFossyRule | null>;

    /**
     * Persist the T0 compiled detector onto an embedded rule (#1449). Passing
     * `null` clears it (rule reverts to semantic). Mirrors updateRuleReferences.
     */
    updateRuleDetector(
        organizationId: string,
        ruleId: string,
        detector: IFossyRuleDetector | null,
    ): Promise<IFossyRule | null>;

    /**
     * Persist the rule's declared context need (#1826). Passing `null` clears
     * a stale inference. An author-set need is never overwritten by an
     * inferred one.
     */
    updateRuleContextNeed(
        organizationId: string,
        ruleId: string,
        contextNeed: IFossyRuleContextNeed | null,
    ): Promise<IFossyRule | null>;

    /**
     * Persist the rule's inferred language scope (#1826). Passing `null`
     * clears it, which is how an edited rule that stopped naming a language
     * gets un-narrowed. An author-set scope is never overwritten by an
     * inferred one.
     */
    updateRuleFileScope(
        organizationId: string,
        ruleId: string,
        fileScope: IFossyRuleFileScope | null,
    ): Promise<IFossyRule | null>;

    /**
     * Record that the detector compiler ran on this rule. A cost gate only: it
     * lets the nightly sweep skip a rule it already decided instead of paying
     * for the same verdict every night. No author variant — nobody authors an
     * attempt.
     */
    updateRuleCompileAttempt(
        organizationId: string,
        ruleId: string,
        compileAttempt: IFossyRuleCompileAttempt | null,
    ): Promise<IFossyRule | null>;

    getRulesLimitStatus(
        organizationAndTeamData: OrganizationAndTeamData,
    ): Promise<{
        total: number;
    }>;

    countRulesByRepository(
        organizationId: string,
    ): Promise<
        Array<{
            repositoryId: string;
            directoryId: string | null;
            count: number;
        }>
    >;

    getRecommendedRulesBySuggestions(
        organizationAndTeamData: OrganizationAndTeamData,
        repositoryId: string,
        repoLanguage?: string,
    ): Promise<LibraryFossyRule[]>;

    createOrUpdateMemory(
        organizationAndTeamData: OrganizationAndTeamData,
        memory: IFossyRuleMemory,
        userInfo?: UserInfo,
    ): Promise<CreateOrUpdateMemoryResult | null>;

    findMemories(
        organizationAndTeamData: OrganizationAndTeamData,
        filters?: FindMemoriesFilters,
    ): Promise<FindMemoriesResult[]>;

    syncRulesWithPlanLimit(
        organizationAndTeamData: OrganizationAndTeamData,
        opts?: { entity?: FossyRulesEntity | null; limited?: boolean },
    ): Promise<FossyRulesEntity | null>;
}
