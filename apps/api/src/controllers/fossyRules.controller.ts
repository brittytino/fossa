import { UserRequest } from '@libs/core/infrastructure/config/types/http/user-request.type';
import { AddLibraryFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/add-library-fossy-rules.use-case';
import { ApplyPendingFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/apply-pending-fossy-rules.use-case';
import { GetPendingFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/get-pending-fossy-rules.use-case';
import { ChangeStatusFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/change-status-fossy-rules.use-case';
import { CheckSyncStatusUseCase } from '@libs/fossyRules/application/use-cases/check-sync-status.use-case';
import { ListPastReviewersUseCase } from '@libs/fossyRules/application/use-cases/list-past-reviewers.use-case';
import { ConvertPendingUpdatesToNewUseCase } from '@libs/fossyRules/application/use-cases/convert-pending-updates-to-new.use-case';
import { CreateOrUpdateFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/create-or-update.use-case';
import { DeleteRuleInOrganizationByIdFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/delete-rule-in-organization-by-id.use-case';
import { FastSyncIdeRulesUseCase } from '@libs/fossyRules/application/use-cases/fast-sync-ide-rules.use-case';
import { FindByOrganizationIdFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/find-by-organization-id.use-case';
import { FindLibraryFossyRulesBucketsUseCase } from '@libs/fossyRules/application/use-cases/find-library-fossy-rules-buckets.use-case';
import { FindLibraryFossyRulesWithFeedbackUseCase } from '@libs/fossyRules/application/use-cases/find-library-fossy-rules-with-feedback.use-case';
import { FindLibraryFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/find-library-fossy-rules.use-case';
import { FindRecommendedFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/find-recommended-fossy-rules.use-case';
import { CountRulesByRepositoryUseCase } from '@libs/fossyRules/application/use-cases/count-rules-by-repository.use-case';
import { FindRulesInOrganizationByRuleFilterFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/find-rules-in-organization-by-filter.use-case';
import { FindSuggestionsByRuleUseCase } from '@libs/fossyRules/application/use-cases/find-suggestions-by-rule.use-case';
import { GenerateFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/generate-fossy-rules.use-case';
import { GetInheritedRulesFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/get-inherited-fossy-rules.use-case';
import { GetRulesLimitStatusUseCase } from '@libs/fossyRules/application/use-cases/get-rules-limit-status.use-case';
import { ImportFastFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/import-fast-fossy-rules.use-case';
import { ManageImportedFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/manage-imported-fossy-rules.use-case';
import { ResyncRulesFromIdeUseCase } from '@libs/fossyRules/application/use-cases/resync-rules-from-ide.use-case';
import { SyncSelectedRepositoriesFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/sync-selected-repositories.use-case';
import { GetGlobalRulesSourceRepositoriesUseCase } from '@libs/fossyRules/application/use-cases/get-global-rules-source-repositories.use-case';
import { UpdateGlobalRulesSourceRepositoriesUseCase } from '@libs/fossyRules/application/use-cases/update-global-rules-source-repositories.use-case';
import { ResyncGlobalRulesUseCase } from '@libs/fossyRules/application/use-cases/resync-global-rules.use-case';
import { GetGlobalRulesImportStatusUseCase } from '@libs/fossyRules/application/use-cases/get-global-rules-import-status.use-case';
import { GlobalRulesSourceRepository } from '@libs/fossyRules/domain/interfaces/global-rules-source.interface';
import { ImportFastFossyRulesDto } from '@libs/fossyRules/dtos/import-fast-fossy-rules.dto';
import { ReviewFastFossyRulesDto } from '../dtos/review-fast-fossy-rules.dto';

import { CacheService } from '@libs/core/cache/cache.service';
import { CreateFossyRuleDto } from '@libs/fossyRules/application/dtos/create-fossy-rule.dto';
import {
    Action,
    ResourceType,
} from '@libs/identity/domain/permissions/enums/permissions.enum';
import { Public } from '@libs/identity/infrastructure/adapters/services/auth/public.decorator';
import {
    CheckPolicies,
    PolicyGuard,
} from '@libs/identity/infrastructure/adapters/services/permissions/policy.guard';
import {
    checkPermissions,
    checkRepoPermissions,
} from '@libs/identity/infrastructure/adapters/services/permissions/policy.handlers';
import {
    IFossyRule,
    FossyRulesStatus,
    FossyRulesType,
} from '@libs/fossyRules/domain/interfaces/fossyRules.interface';
import { AddLibraryFossyRulesDto } from '@libs/fossyRules/dtos/add-library-fossy-rules.dto';
import { ChangeStatusFossyRulesDTO } from '@libs/fossyRules/dtos/change-status-fossy-rules.dto';
import { ManageImportedFossyRulesDto } from '@libs/fossyRules/dtos/manage-imported-fossy-rules.dto';
import { RuleIdsDto } from '@libs/fossyRules/dtos/rule-ids.dto';
import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { FossyRulesTenantGuard } from '../guards/fossy-rules-tenant.guard';
import { REQUEST } from '@nestjs/core';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { ApiStandardResponses } from '../docs/api-standard-responses.decorator';
import {
    ApiArrayResponseDto,
    ApiBooleanResponseDto,
    ApiObjectResponseDto,
} from '../dtos/api-response.dto';
import { FindLibraryFossyRulesDto } from '../dtos/find-library-fossy-rules.dto';
import { FindRecommendedFossyRulesDto } from '../dtos/find-recommended-fossy-rules.dto';
import { FindSuggestionsByRuleDto } from '../dtos/find-suggestions-by-rule.dto';
import { GenerateFossyRulesDTO } from '../dtos/generate-fossy-rules.dto';
import {
    FossyRuleResponseDto,
    FossyRulesArrayResponseDto,
    FossyRulesPendingResponseDto,
    FossyRulesBucketsResponseDto,
    FossyRulesFastSyncResponseDto,
    FossyRulesFindByOrgResponseDto,
    FossyRulesInheritedResponseDto,
    FossyRulesLibraryResponseDto,
    FossyRulesLimitResponseDto,
    FossyRulesSyncStatusResponseDto,
} from '../dtos/fossy-rules-response.dto';

@ApiTags('Fossy Rules')
@ApiStandardResponses()
@Controller('fossy-rules')
export class FossyRulesController {
    constructor(
        private readonly createOrUpdateFossyRulesUseCase: CreateOrUpdateFossyRulesUseCase,
        private readonly findByOrganizationIdFossyRulesUseCase: FindByOrganizationIdFossyRulesUseCase,
        private readonly findRulesInOrganizationByRuleFilterFossyRulesUseCase: FindRulesInOrganizationByRuleFilterFossyRulesUseCase,
        private readonly deleteRuleInOrganizationByIdFossyRulesUseCase: DeleteRuleInOrganizationByIdFossyRulesUseCase,
        private readonly findLibraryFossyRulesUseCase: FindLibraryFossyRulesUseCase,
        private readonly findLibraryFossyRulesWithFeedbackUseCase: FindLibraryFossyRulesWithFeedbackUseCase,
        private readonly findLibraryFossyRulesBucketsUseCase: FindLibraryFossyRulesBucketsUseCase,
        private readonly findRecommendedFossyRulesUseCase: FindRecommendedFossyRulesUseCase,
        private readonly addLibraryFossyRulesUseCase: AddLibraryFossyRulesUseCase,
        private readonly generateFossyRulesUseCase: GenerateFossyRulesUseCase,
        private readonly applyPendingFossyRulesUseCase: ApplyPendingFossyRulesUseCase,
        private readonly getPendingFossyRulesUseCase: GetPendingFossyRulesUseCase,
        private readonly changeStatusFossyRulesUseCase: ChangeStatusFossyRulesUseCase,
        private readonly checkSyncStatusUseCase: CheckSyncStatusUseCase,
        private readonly listPastReviewersUseCase: ListPastReviewersUseCase,
        private readonly cacheService: CacheService,
        private readonly syncSelectedReposFossyRulesUseCase: SyncSelectedRepositoriesFossyRulesUseCase,
        private readonly getGlobalRulesSourceRepositoriesUseCase: GetGlobalRulesSourceRepositoriesUseCase,
        private readonly updateGlobalRulesSourceRepositoriesUseCase: UpdateGlobalRulesSourceRepositoriesUseCase,
        private readonly resyncGlobalRulesUseCase: ResyncGlobalRulesUseCase,
        private readonly getGlobalRulesImportStatusUseCase: GetGlobalRulesImportStatusUseCase,
        private readonly getInheritedRulesFossyRulesUseCase: GetInheritedRulesFossyRulesUseCase,
        private readonly getRulesLimitStatusUseCase: GetRulesLimitStatusUseCase,
        private readonly findSuggestionsByRuleUseCase: FindSuggestionsByRuleUseCase,
        private readonly resyncRulesFromIdeUseCase: ResyncRulesFromIdeUseCase,
        private readonly fastSyncIdeRulesUseCase: FastSyncIdeRulesUseCase,
        private readonly importFastFossyRulesUseCase: ImportFastFossyRulesUseCase,
        private readonly convertPendingUpdatesToNewUseCase: ConvertPendingUpdatesToNewUseCase,
        private readonly manageImportedFossyRulesUseCase: ManageImportedFossyRulesUseCase,
        private readonly countRulesByRepositoryUseCase: CountRulesByRepositoryUseCase,
        @Inject(REQUEST)
        private readonly request: UserRequest,
    ) {}

    @ApiBearerAuth('jwt')
    @Post('/create-or-update')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Create,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Create or update rule',
        description: 'Create a new rule or update an existing one.',
    })
    @ApiCreatedResponse({ type: FossyRuleResponseDto })
    public async create(
        @Body()
        body: CreateFossyRuleDto,
    ) {
        if (!this.request.user.organization.uuid) {
            throw new Error('Organization ID not found');
        }

        return this.createOrUpdateFossyRulesUseCase.execute(
            body,
            this.request.user.organization.uuid,
            undefined,
            undefined,
            body.teamId,
            this.request.user,
        );
    }

    @ApiBearerAuth('jwt')
    @Get('/find-by-organization-id')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Read,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'List rules by organization',
        description: 'Return all rules for the current organization.',
    })
    @ApiOkResponse({ type: FossyRulesFindByOrgResponseDto })
    public async findByOrganizationId() {
        return this.findByOrganizationIdFossyRulesUseCase.execute();
    }

    @ApiBearerAuth('jwt')
    @Get('/limits')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Read,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Get rules limit status',
        description: 'Return the current fossy rules limit usage.',
    })
    @ApiOkResponse({ type: FossyRulesLimitResponseDto })
    public async getRulesLimitStatus() {
        return this.getRulesLimitStatusUseCase.execute();
    }

    @ApiBearerAuth('jwt')
    @Get('/counts-by-repository')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Read,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Count rules per repository/directory',
        description:
            'Returns ACTIVE+PAUSED rule counts grouped by (repositoryId, ' +
            'directoryId) for the org in a single aggregation. Drives the ' +
            'per-repository/directory count badges without fetching each ' +
            "repo's full rules array per card.",
    })
    @ApiOkResponse({ type: ApiArrayResponseDto })
    public async countRulesByRepository() {
        return this.countRulesByRepositoryUseCase.execute();
    }

    @ApiBearerAuth('jwt')
    @Get('/suggestions')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Read,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Get suggestions by rule',
        description: 'Return suggestions for a specific rule.',
    })
    @ApiOkResponse({ type: ApiArrayResponseDto })
    public async findSuggestionsByRule(
        @Query() query: FindSuggestionsByRuleDto,
    ) {
        return this.findSuggestionsByRuleUseCase.execute(query.ruleId);
    }

    @ApiBearerAuth('jwt')
    @Get('/find-rules-in-organization-by-filter')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Read,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Find rules by filter',
        description: 'Return rules matching a key/value filter.',
    })
    @ApiQuery({ name: 'key', type: String, required: false })
    @ApiQuery({ name: 'value', type: String, required: false })
    @ApiQuery({ name: 'repositoryId', type: String, required: false })
    @ApiQuery({ name: 'directoryId', type: String, required: false })
    @ApiQuery({ name: 'type', enum: FossyRulesType, required: false })
    @ApiOkResponse({ type: ApiArrayResponseDto })
    public async findRulesInOrganizationByFilter(
        @Query('key')
        key?: string,
        @Query('value')
        value?: string,
        @Query('repositoryId')
        repositoryId?: string,
        @Query('directoryId')
        directoryId?: string,
        @Query('type')
        type?: FossyRulesType,
    ) {
        if (!this.request.user.organization.uuid) {
            throw new Error('Organization ID not found');
        }

        const filter: Partial<IFossyRule> = {};
        if (key && value !== undefined) {
            (filter as Record<string, unknown>)[key] = value;
        }
        if (type) {
            filter.type = type;
        }

        return this.findRulesInOrganizationByRuleFilterFossyRulesUseCase.execute(
            this.request.user.organization.uuid,
            filter,
            repositoryId,
            directoryId,
        );
    }

    @ApiBearerAuth('jwt')
    @Delete('/delete-rule-in-organization-by-id')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Delete,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Delete rule by id',
        description: 'Delete a rule in the organization by rule id.',
    })
    @ApiQuery({ name: 'ruleId', type: String, required: true })
    @ApiQuery({ name: 'teamId', type: String, required: false })
    @ApiOkResponse({ type: ApiBooleanResponseDto })
    public async deleteRuleInOrganizationById(
        @Query('ruleId')
        ruleId: string,
        @Query('teamId')
        teamId?: string,
    ) {
        return this.deleteRuleInOrganizationByIdFossyRulesUseCase.execute(
            ruleId,
            {
                source: 'web',
                teamId,
            },
            this.request.user,
        );
    }

    @Get('/find-library-fossy-rules')
    @Public()
    @ApiOperation({
        summary: 'List library rules',
        description: 'Return library rules with pagination.',
    })
    @ApiOkResponse({ type: FossyRulesLibraryResponseDto })
    public async findLibraryFossyRules(@Query() query: FindLibraryFossyRulesDto) {
        return this.findLibraryFossyRulesUseCase.execute(query);
    }

    @ApiBearerAuth('jwt')
    @Get('/find-library-fossy-rules-with-feedback')
    @ApiOperation({
        summary: 'List library rules with feedback',
        description: 'Return library rules with user feedback and pagination.',
    })
    @ApiOkResponse({ type: FossyRulesLibraryResponseDto })
    public async findLibraryFossyRulesWithFeedback(
        @Query() query: FindLibraryFossyRulesDto,
    ) {
        return this.findLibraryFossyRulesWithFeedbackUseCase.execute(query);
    }

    @Get('/find-library-fossy-rules-buckets')
    @Public()
    @ApiOperation({
        summary: 'List library buckets',
        description: 'Return available fossy rules buckets.',
    })
    @ApiOkResponse({ type: FossyRulesBucketsResponseDto })
    public async findLibraryFossyRulesBuckets() {
        return this.findLibraryFossyRulesBucketsUseCase.execute();
    }

    @ApiBearerAuth('jwt')
    @Get('/find-recommended-fossy-rules')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Read,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Find recommended rules',
        description: 'Return recommended rules for the organization.',
    })
    @ApiQuery({ name: 'limit', type: Number, required: false })
    @ApiOkResponse({ type: ApiArrayResponseDto })
    public async findRecommendedFossyRules(
        @Query() query: FindRecommendedFossyRulesDto,
    ) {
        if (!this.request.user.organization.uuid) {
            throw new Error('Organization ID not found');
        }

        const limit = query.limit || 10;
        const cacheKey = `recommended-fossy-rules:${this.request.user.organization.uuid}:${limit}`;

        const cachedResult = await this.cacheService.getFromCache(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        const result = await this.findRecommendedFossyRulesUseCase.execute(
            {
                organizationId: this.request.user.organization.uuid,
                teamId: (this.request.user as any).team?.uuid,
            },
            limit,
        );

        await this.cacheService.addToCache(cacheKey, result, 259200000);

        return result;
    }

    @ApiBearerAuth('jwt')
    @Post('/add-library-fossy-rules')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Create,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Add library rules',
        description: 'Add library rules to the organization repositories.',
    })
    @ApiCreatedResponse({ type: FossyRulesArrayResponseDto })
    public async addLibraryFossyRules(@Body() body: AddLibraryFossyRulesDto) {
        return this.addLibraryFossyRulesUseCase.execute(body);
    }

    @ApiBearerAuth('jwt')
    @Post('/generate-fossy-rules')
    @UseGuards(PolicyGuard, FossyRulesTenantGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Create,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Generate rules',
        description: 'Generate rules based on repository history.',
    })
    @ApiCreatedResponse({ type: FossyRulesArrayResponseDto })
    public async generateFossyRules(@Body() body: GenerateFossyRulesDTO) {
        if (!this.request.user.organization.uuid) {
            throw new Error('Organization ID not found');
        }

        return this.generateFossyRulesUseCase.execute(
            body,
            this.request.user.organization.uuid,
        );
    }

    @ApiBearerAuth('jwt')
    @Post('/change-status-fossy-rules')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Update,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Change rule status',
        description: 'Update status for one or more rules.',
    })
    @ApiCreatedResponse({ type: FossyRulesArrayResponseDto })
    public async changeStatusFossyRules(@Body() body: ChangeStatusFossyRulesDTO) {
        return this.changeStatusFossyRulesUseCase.execute(body);
    }

    @ApiBearerAuth('jwt')
    @Post('/pending/apply')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Update,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Apply pending rules',
        description: 'Approve one or more pending rules/memories.',
    })
    @ApiCreatedResponse({ type: FossyRulesArrayResponseDto })
    public async applyPendingFossyRules(@Body() body: RuleIdsDto) {
        return this.applyPendingFossyRulesUseCase.execute(body);
    }

    @ApiBearerAuth('jwt')
    @Post('/pending/discard')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Update,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Discard pending rules',
        description: 'Reject one or more pending rules/memories.',
    })
    @ApiCreatedResponse({ type: FossyRulesArrayResponseDto })
    public async discardPendingFossyRules(@Body() body: RuleIdsDto) {
        return this.changeStatusFossyRulesUseCase.execute({
            ruleIds: body.ruleIds,
            status: FossyRulesStatus.REJECTED,
        });
    }

    @ApiBearerAuth('jwt')
    @Post('/pending/convert-updates-to-new')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Update,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Convert pending updates to new rules/memories',
        description:
            'For each pending update request, create a new active rule/memory and discard the original pending request.',
    })
    @ApiCreatedResponse({ type: FossyRulesArrayResponseDto })
    public async convertPendingUpdatesToNew(@Body() body: RuleIdsDto) {
        return this.convertPendingUpdatesToNewUseCase.execute(body);
    }

    @ApiBearerAuth('jwt')
    @Get('/check-sync-status')
    @UseGuards(PolicyGuard, FossyRulesTenantGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Read,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Check sync status',
        description: 'Return sync status flags for IDE and generator.',
    })
    @ApiQuery({ name: 'teamId', type: String, required: true })
    @ApiQuery({ name: 'repositoryId', type: String, required: false })
    @ApiOkResponse({ type: FossyRulesSyncStatusResponseDto })
    public async checkSyncStatus(
        @Query('teamId')
        teamId: string,
        @Query('repositoryId')
        repositoryId?: string,
    ) {
        const cacheKey = `check-sync-status:${this.request.user.organization.uuid}:${teamId}:${repositoryId || 'no-repo'}`;

        // Tenta buscar do cache primeiro
        const cachedResult = await this.cacheService.getFromCache(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        // If not in cache, execute the use case
        const result = await this.checkSyncStatusUseCase.execute(
            teamId,
            repositoryId,
        );

        // Salva no cache por 15 minutos
        await this.cacheService.addToCache(cacheKey, result, 900000); // 15 minutos em milissegundos

        return result;
    }

    @ApiBearerAuth('jwt')
    @Get('/past-reviewers')
    @UseGuards(PolicyGuard, FossyRulesTenantGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Read,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'List past reviewers',
        description:
            'Candidate git reviewers (current members ∪ PR authors in the window) a client can exclude from Fossy Rules learning.',
    })
    @ApiQuery({ name: 'teamId', type: String, required: true })
    @ApiQuery({ name: 'repositoryId', type: String, required: false })
    @ApiQuery({ name: 'months', type: Number, required: false })
    public async listPastReviewers(
        @Query('teamId') teamId: string,
        @Query('repositoryId') repositoryId?: string,
        @Query('months') months?: string,
    ) {
        // Just parse the query string here; the use-case validates/bounds it.
        return this.listPastReviewersUseCase.execute({
            teamId,
            repositoryId,
            months: months !== undefined ? Number(months) : undefined,
        });
    }

    @ApiBearerAuth('jwt')
    @Post('/sync-ide-rules')
    @UseGuards(PolicyGuard, FossyRulesTenantGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Create,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Sync IDE rules',
        description: 'Sync IDE rules for a repository.',
    })
    @ApiNoContentResponse({ description: 'Sync started' })
    public async syncIdeRules(
        @Body() body: { teamId: string; repositoryId: string },
    ) {
        const respositories = [body.repositoryId];

        return this.syncSelectedReposFossyRulesUseCase.execute({
            teamId: body.teamId,
            repositoriesIds: respositories,
        });
    }

    @ApiBearerAuth('jwt')
    @Post('/fast-sync-ide-rules')
    @UseGuards(PolicyGuard, FossyRulesTenantGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Create,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Fast sync IDE rules',
        description: 'Fast sync IDE rules with optional limits.',
    })
    @ApiCreatedResponse({ type: FossyRulesFastSyncResponseDto })
    public async fastSyncIdeRules(
        @Body()
        body: {
            teamId: string;
            repositoryId: string;
            maxFiles?: number;
            maxFileSizeBytes?: number;
            maxTotalBytes?: number;
        },
    ) {
        return this.fastSyncIdeRulesUseCase.execute(body);
    }

    @ApiBearerAuth('jwt')
    @Get('/global-source-repositories')
    @UseGuards(PolicyGuard, FossyRulesTenantGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Read,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'List global-rules source repositories',
        description:
            'Return the repositories currently selected as sources of global Fossy Rules.',
    })
    @ApiQuery({ name: 'teamId', type: String, required: true })
    public async getGlobalSourceRepositories(
        @Query('teamId') teamId: string,
    ) {
        return this.getGlobalRulesSourceRepositoriesUseCase.execute({ teamId });
    }

    @ApiBearerAuth('jwt')
    @Get('/global-source-repositories/import-status')
    @UseGuards(PolicyGuard, FossyRulesTenantGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Read,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Global-rules import quota status',
        description:
            'Return the plan tier (free/trial/paid), the import limit, and how many global rules are already imported, so the UI can gate the control.',
    })
    @ApiQuery({ name: 'teamId', type: String, required: true })
    public async getGlobalRulesImportStatus(
        @Query('teamId') teamId: string,
    ) {
        return this.getGlobalRulesImportStatusUseCase.execute({ teamId });
    }

    @ApiBearerAuth('jwt')
    @Post('/global-source-repositories')
    @UseGuards(PolicyGuard, FossyRulesTenantGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Create,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Set global-rules source repositories',
        description:
            'Persist the selected source repositories for global Fossy Rules; imports added repos and removes rules from deselected ones.',
    })
    public async setGlobalSourceRepositories(
        @Body()
        body: {
            teamId: string;
            repositories: GlobalRulesSourceRepository[];
        },
    ) {
        return this.updateGlobalRulesSourceRepositoriesUseCase.execute({
            teamId: body.teamId,
            repositories: body.repositories ?? [],
        });
    }

    @ApiBearerAuth('jwt')
    @Post('/resync-global-rules')
    @UseGuards(PolicyGuard, FossyRulesTenantGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Create,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Resync global rules',
        description:
            'Re-scan every configured source repository into the global scope (covers direct-push changes).',
    })
    public async resyncGlobalRules(@Body() body: { teamId: string }) {
        return this.resyncGlobalRulesUseCase.execute({ teamId: body.teamId });
    }

    @ApiBearerAuth('jwt')
    @Get('/pending')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Read,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'List pending rules and memories',
        description:
            'Return every pending Fossy Rule and Memory for the org (optionally scoped to a repository), with counts for the Pending badge.',
    })
    @ApiQuery({ name: 'repositoryId', type: String, required: false })
    @ApiOkResponse({ type: FossyRulesPendingResponseDto })
    public async getPending(@Query('repositoryId') repositoryId?: string) {
        return this.getPendingFossyRulesUseCase.execute({ repositoryId });
    }

    @ApiBearerAuth('jwt')
    @Get('/pending-ide-rules')
    @UseGuards(PolicyGuard, FossyRulesTenantGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Read,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'List pending IDE rules (deprecated)',
        description:
            'Deprecated: use GET /fossy-rules/pending. Returns pending rules for a repository.',
    })
    @ApiQuery({ name: 'teamId', type: String, required: true })
    @ApiQuery({ name: 'repositoryId', type: String, required: false })
    @ApiOkResponse({ type: ApiArrayResponseDto })
    public async listPendingIdeRules(
        @Query('teamId') teamId: string,
        @Query('repositoryId') repositoryId?: string,
    ) {
        const organizationId = this.request.user.organization.uuid;
        return this.findRulesInOrganizationByRuleFilterFossyRulesUseCase.execute(
            organizationId,
            { status: FossyRulesStatus.PENDING },
            repositoryId,
        );
    }

    @ApiBearerAuth('jwt')
    @Post('/import-fast-ide-rules')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Create,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Import fast IDE rules',
        description: 'Import rules from fast sync results.',
    })
    @ApiCreatedResponse({ type: FossyRulesArrayResponseDto })
    public async importFastIdeRules(@Body() body: ImportFastFossyRulesDto) {
        return this.importFastFossyRulesUseCase.execute(body);
    }

    @ApiBearerAuth('jwt')
    @Post('/review-fast-ide-rules')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Update,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Review fast IDE rules',
        description: 'Activate or delete fast imported rules.',
    })
    @ApiCreatedResponse({ type: ApiObjectResponseDto })
    public async reviewFastIdeRules(@Body() body: ReviewFastFossyRulesDto) {
        const results: any = {};

        if (body.activateRuleIds?.length) {
            results.activated = await this.changeStatusFossyRulesUseCase.execute(
                {
                    ruleIds: body.activateRuleIds,
                    status: FossyRulesStatus.ACTIVE,
                },
            );
        }

        if (body.deleteRuleIds?.length) {
            results.deleted = await this.changeStatusFossyRulesUseCase.execute({
                ruleIds: body.deleteRuleIds,
                status: FossyRulesStatus.DELETED,
            });
        }

        return results;
    }

    @ApiBearerAuth('jwt')
    @Get('/inherited-rules')
    @UseGuards(PolicyGuard, FossyRulesTenantGuard)
    @CheckPolicies(
        checkRepoPermissions({
            action: Action.Read,
            resource: ResourceType.FossyRules,
            repo: {
                key: {
                    query: 'repositoryId',
                },
            },
        }),
    )
    @ApiOperation({
        summary: 'Get inherited rules',
        description: 'Return global and repository inherited rules.',
    })
    @ApiOkResponse({ type: FossyRulesInheritedResponseDto })
    public async getInheritedRules(
        @Query('teamId') teamId: string,
        @Query('repositoryId') repositoryId: string,
        @Query('directoryId') directoryId?: string,
    ) {
        if (!this.request.user.organization.uuid) {
            throw new Error('Organization ID not found');
        }

        if (!teamId) {
            throw new Error('Team ID is required');
        }

        if (!repositoryId) {
            throw new Error('Repository ID is required');
        }

        return this.getInheritedRulesFossyRulesUseCase.execute(
            {
                organizationId: this.request.user.organization.uuid,
                teamId,
            },
            repositoryId,
            directoryId,
        );
    }

    // NOT USED IN WEB - INTERNAL USE ONLY
    @ApiBearerAuth('jwt')
    @Post('/resync-ide-rules')
    @UseGuards(PolicyGuard, FossyRulesTenantGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Create,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Resync IDE rules',
        description: 'Resync IDE rules (internal).',
    })
    @ApiNoContentResponse({ description: 'Resync started' })
    public async resyncIdeRules(
        @Body() body: { teamId: string; repositoryId: string; path?: string },
    ) {
        const respositories = [body.repositoryId];

        return this.resyncRulesFromIdeUseCase.execute({
            teamId: body.teamId,
            repositoriesIds: respositories,
            path: body.path,
        });
    }

    @ApiBearerAuth('jwt')
    @Post('/imported/manage')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Update,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Pause / resume / delete imported (auto-synced) rules',
        description:
            'Acts on the IDE-synced Fossy Rules of a repository in bulk. ' +
            'Used by the toggle-off modal in the web UI and by the orphan-rules ' +
            'banner. See ManageImportedRulesAction for action semantics.',
    })
    @ApiOkResponse({ type: ApiObjectResponseDto })
    public async manageImportedRules(@Body() body: ManageImportedFossyRulesDto) {
        const organizationId = this.request.user.organization.uuid;
        if (!organizationId) {
            throw new Error('Organization ID not found');
        }
        const teamId = (this.request.user as any).team?.uuid;

        return this.manageImportedFossyRulesUseCase.execute({
            organizationAndTeamData: { organizationId, teamId },
            repositoryId: body.repositoryId,
            action: body.action,
        });
    }

    @ApiBearerAuth('jwt')
    @Get('/imported/count')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Read,
            resource: ResourceType.FossyRules,
        }),
    )
    @ApiOperation({
        summary: 'Count imported (auto-synced) rules per status',
        description:
            'Returns { active, paused, deleted } counts of IDE-synced rules ' +
            'for a repository. Drives copy on the toggle-off confirmation modal ' +
            'and the orphan-rules banner.',
    })
    @ApiQuery({ name: 'repositoryId', type: String, required: true })
    @ApiOkResponse({ type: ApiObjectResponseDto })
    public async countImportedRules(
        @Query('repositoryId') repositoryId: string,
    ) {
        const organizationId = this.request.user.organization.uuid;
        if (!organizationId) {
            throw new Error('Organization ID not found');
        }
        const teamId = (this.request.user as any).team?.uuid;

        return this.manageImportedFossyRulesUseCase.count({
            organizationAndTeamData: { organizationId, teamId },
            repositoryId,
        });
    }
}
