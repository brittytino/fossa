import {
    CreateFossyRuleDto,
    FossyRuleSeverity,
} from '@libs/fossyRules/application/dtos/create-fossy-rule.dto';
import { Public } from '@libs/identity/infrastructure/adapters/services/auth/public.decorator';
import { CreateOrUpdateFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/create-or-update.use-case';
import { FindRulesInOrganizationByRuleFilterFossyRulesUseCase } from '@libs/fossyRules/application/use-cases/find-rules-in-organization-by-filter.use-case';
import {
    IFossyRule,
    FossyRulesScope,
    FossyRulesOrigin,
    FossyRulesStatus,
    FossyRulesType,
} from '@libs/fossyRules/domain/interfaces/fossyRules.interface';
import {
    ITeamCliKeyService,
    TEAM_CLI_KEY_SERVICE_TOKEN,
} from '@libs/organization/domain/team-cli-key/contracts/team-cli-key.service.contract';
import { TEAM_CLI_KEY_CAPABILITIES } from '@libs/organization/domain/team-cli-key/interfaces/team-cli-key.interface';
import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Headers,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    UnauthorizedException,
} from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiHeader,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { ApiStandardResponses } from '../../docs/api-standard-responses.decorator';
import {
    FossyRuleResponseDto,
    FossyRulesArrayResponseDto,
} from '../../dtos/fossy-rules-response.dto';

@ApiTags('CLI Fossy Rules')
@ApiStandardResponses()
@Public()
@Controller('cli/fossy-rules')
export class CliFossyRulesController {
    constructor(
        @Inject(TEAM_CLI_KEY_SERVICE_TOKEN)
        private readonly teamCliKeyService: ITeamCliKeyService,

        private readonly createOrUpdateFossyRuleUseCase: CreateOrUpdateFossyRulesUseCase,
        private readonly findFossyRulesUseCase: FindRulesInOrganizationByRuleFilterFossyRulesUseCase,
    ) {}

    @Get()
    @ApiOperation({
        summary: 'List Fossy Rules',
        description:
            'Retrieve a list of Fossy Rules for the authenticated team.',
    })
    @ApiHeader({
        name: 'x-team-key',
        required: false,
        description: 'Team CLI key (alternative to Authorization: Bearer)',
    })
    @ApiHeader({
        name: 'authorization',
        required: false,
        description: 'Bearer Team CLI key (alternative to x-team-key)',
    })
    @ApiQuery({
        name: 'ruleId',
        required: false,
        type: String,
        description: 'Filter by Fossy Rule UUID',
    })
    @ApiQuery({
        name: 'repositoryId',
        required: false,
        type: String,
        description: 'Filter by Repository ID',
    })
    @ApiOkResponse({ type: FossyRulesArrayResponseDto })
    async listFossyRules(
        @Headers('x-team-key') teamKey?: string,
        @Headers('authorization') authHeader?: string,
        @Query('ruleId') ruleId?: string,
        @Query('repositoryId') repositoryId?: string,
    ) {
        const authContext = await this.resolveCliContext(teamKey, authHeader);
        await this.ensureFossyRulesCapability(authContext);

        const filter: Partial<IFossyRule> = {};
        if (ruleId) filter.uuid = ruleId;
        else if (repositoryId) filter.repositoryId = repositoryId;

        return await this.findFossyRulesUseCase.execute(
            authContext.organizationId,
            filter,
        );
    }

    @Post()
    @ApiOperation({
        summary: 'Create a Fossy Rule',
        description: 'Create a new Fossy Rule with the provided details.',
    })
    @ApiHeader({
        name: 'x-team-key',
        required: false,
        description: 'Team CLI key (alternative to Authorization: Bearer)',
    })
    @ApiHeader({
        name: 'authorization',
        required: false,
        description: 'Bearer Team CLI key (alternative to x-team-key)',
    })
    @ApiCreatedResponse({ type: FossyRuleResponseDto })
    async createFossyRule(
        @Body() body: Partial<IFossyRule>,
        @Headers('x-team-key') teamKey?: string,
        @Headers('authorization') authHeader?: string,
    ) {
        const authContext = await this.resolveCliContext(teamKey, authHeader);
        await this.ensureFossyRulesCapability(authContext);

        if (body.uuid != undefined) {
            throw new ForbiddenException(
                'UUID should not be provided when creating a new Fossy Rule',
            );
        }
        const requiredFieldsBody = this.convertToDTO(body);

        return await this.createOrUpdateFossyRuleUseCase.execute(
            requiredFieldsBody,
            authContext.organizationId,
            undefined,
            undefined,
            authContext.teamId,
        );
    }

    @Patch(':ruleId')
    @ApiOperation({
        summary: 'Update a Fossy Rule',
        description: 'Update an existing Fossy Rule with the provided details.',
    })
    @ApiHeader({
        name: 'x-team-key',
        required: false,
        description: 'Team CLI key (alternative to Authorization: Bearer)',
    })
    @ApiHeader({
        name: 'authorization',
        required: false,
        description: 'Bearer Team CLI key (alternative to x-team-key)',
    })
    @ApiParam({
        name: 'ruleId',
        required: true,
        type: String,
        description: 'Fossy Rule UUID to update',
    })
    @ApiOkResponse({ type: FossyRuleResponseDto })
    async updateFossyRule(
        @Body() body: Partial<IFossyRule>,
        @Param('ruleId') ruleId: string,
        @Headers('x-team-key') teamKey?: string,
        @Headers('authorization') authHeader?: string,
    ) {
        const authContext = await this.resolveCliContext(teamKey, authHeader);
        await this.ensureFossyRulesCapability(authContext);

        if (!ruleId) {
            throw new ForbiddenException('Rule ID is required for update');
        }

        if (body.uuid && body.uuid !== ruleId) {
            throw new ForbiddenException(
                'Body UUID must match the ruleId path parameter',
            );
        }

        const patchPayload = this.convertPatchToDTO(body, ruleId);

        return await this.createOrUpdateFossyRuleUseCase.execute(
            patchPayload,
            authContext.organizationId,
            undefined,
            undefined,
            authContext.teamId,
        );
    }

    private async resolveCliContext(teamKey?: string, authHeader?: string) {
        const bearerToken = authHeader?.replace(/^Bearer\s+/i, '');
        const resolvedTeamKey = teamKey || bearerToken;

        if (!resolvedTeamKey || !resolvedTeamKey.startsWith('fossa_')) {
            throw new UnauthorizedException('Team API key required');
        }

        const teamData =
            await this.teamCliKeyService.validateKey(resolvedTeamKey);

        if (!teamData?.team?.uuid || !teamData?.organization?.uuid) {
            throw new UnauthorizedException('Invalid or revoked team API key');
        }

        return {
            organizationId: teamData.organization.uuid,
            teamId: teamData.team.uuid,
            config: teamData.config,
        };
    }

    private ensureFossyRulesCapability(context: {
        organizationId: string;
        teamId: string;
        config?: {
            capabilities?: string[];
        };
    }) {
        const hasCapability =
            context.config?.capabilities?.includes(
                TEAM_CLI_KEY_CAPABILITIES.FOSSY_RULES_MANAGE,
            ) ?? false;

        if (!hasCapability) {
            throw new ForbiddenException(
                'Team API key does not have permission to manage Fossy Rules',
            );
        }
    }

    private convertToDTO(body: Partial<IFossyRule>) {
        const requiredFields = ['title', 'rule', 'repositoryId'];
        const missingFields = requiredFields.filter(
            (field) => body[field as keyof IFossyRule] == undefined,
        );

        if (missingFields.length > 0) {
            throw new ForbiddenException(
                `Missing required fields: ${missingFields.join(', ')}`,
            );
        }

        return {
            title: body.title,
            rule: body.rule,
            status: body.status || FossyRulesStatus.ACTIVE,
            type: body.type || FossyRulesType.STANDARD,
            path: body.path || '*/**',
            origin: body.origin || FossyRulesOrigin.CLI,
            scope: body.scope || FossyRulesScope.FILE,
            severity:
                (body.severity as FossyRuleSeverity) || FossyRuleSeverity.MEDIUM,
            examples: body.examples || [],
            repositoryId: body.repositoryId,
        };
    }

    private convertPatchToDTO(
        body: Partial<IFossyRule>,
        ruleId: string,
    ): CreateFossyRuleDto {
        const fields: Array<keyof IFossyRule> = [
            'title',
            'rule',
            'repositoryId',
            'severity',
            'scope',
            'path',
        ];

        for (const field of fields) {
            if (field in body && body[field] == null) {
                throw new ForbiddenException(
                    `Field '${field}' cannot be set to null or undefined.`,
                );
            }
        }

        return {
            ...body,
            uuid: ruleId,
        } as CreateFossyRuleDto;
    }
}
