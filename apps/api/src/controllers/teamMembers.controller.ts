import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseBoolPipe,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { TeamQueryDto } from '@libs/organization/dtos/teamId-query.dto';
import {
    CheckPolicies,
    PolicyGuard,
} from '@libs/identity/infrastructure/adapters/services/permissions/policy.guard';
import {
    Action,
    ResourceType,
} from '@libs/identity/domain/permissions/enums/permissions.enum';
import { checkPermissions } from '@libs/identity/infrastructure/adapters/services/permissions/policy.handlers';
import { IMembers } from '@libs/organization/domain/teamMembers/interfaces/teamMembers.interface';
import { CreateOrUpdateTeamMembersUseCase } from '@libs/organization/application/use-cases/teamMembers/create.use-case';
import { GetTeamMembersUseCase } from '@libs/organization/application/use-cases/teamMembers/get-team-members.use-case';
import { DeleteTeamMembersUseCase } from '@libs/organization/application/use-cases/teamMembers/delete.use-case';
import {
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { ApiStandardResponses } from '../docs/api-standard-responses.decorator';
import { ApiStringArrayResponseDto } from '../dtos/api-response.dto';
import {
    TeamMembersResponseDto,
    TeamMembersUpsertResponseDto,
} from '../dtos/team-response.dto';

@ApiTags('Team Members')
@ApiBearerAuth('jwt')
@ApiStandardResponses()
@Controller('team-members')
export class TeamMembersController {
    constructor(
        private readonly createOrUpdateTeamMembersUseCase: CreateOrUpdateTeamMembersUseCase,
        private readonly getTeamMembersUseCase: GetTeamMembersUseCase,
        private readonly deleteTeamMembersUseCase: DeleteTeamMembersUseCase,
    ) {}

    @Get('/')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Read,
            resource: ResourceType.UserSettings,
        }),
    )
    @ApiOperation({
        summary: 'List team members',
        description: 'Return members for a given team.',
    })
    @ApiQuery({ name: 'teamId', type: String, required: true })
    @ApiOkResponse({ type: TeamMembersResponseDto })
    public async getTeamMembers(@Query() query: TeamQueryDto) {
        return this.getTeamMembersUseCase.execute(query.teamId);
    }

    @Post('/')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Create,
            resource: ResourceType.UserSettings,
        }),
    )
    @ApiOperation({
        summary: 'Create or update team members',
        description: 'Create or update members for a team.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                members: { type: 'array', items: { type: 'object' } },
                teamId: { type: 'string' },
            },
            required: ['members', 'teamId'],
            example: {
                teamId: 'c33ef663-70e7-4f43-9605-0bbef979b8e0',
                members: [
                    { userId: 'user_123', role: 'member' },
                    { userId: 'user_456', role: 'admin' },
                ],
            },
        },
    })
    @ApiCreatedResponse({ type: TeamMembersUpsertResponseDto })
    public async createOrUpdateTeamMembers(
        @Body() body: { members: IMembers[]; teamId: string },
    ) {
        return this.createOrUpdateTeamMembersUseCase.execute(
            body.teamId,
            body.members,
        );
    }

    @Delete('/:uuid')
    @UseGuards(PolicyGuard)
    @CheckPolicies(
        checkPermissions({
            action: Action.Delete,
            resource: ResourceType.UserSettings,
        }),
    )
    @ApiOperation({
        summary: 'Delete team member',
        description: 'Remove a team member by UUID.',
    })
    @ApiQuery({ name: 'removeAll', type: Boolean, required: false })
    @ApiNoContentResponse({ description: 'Member removed' })
    @ApiOkResponse({ type: ApiStringArrayResponseDto })
    public async deleteTeamMember(
        @Param('uuid') uuid: string,
        @Query('removeAll', new DefaultValuePipe(false), ParseBoolPipe)
        removeAll: boolean,
    ) {
        return this.deleteTeamMembersUseCase.execute(uuid, removeAll);
    }
}
