import { Controller, Get } from '@nestjs/common';

import { ListTeamsWithIntegrationsUseCase } from '@libs/organization/application/use-cases/team/list-with-integrations.use-case';
import { ListTeamsUseCase } from '@libs/organization/application/use-cases/team/list.use-case';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { ApiStandardResponses } from '../docs/api-standard-responses.decorator';
import { ApiArrayResponseDto } from '../dtos/api-response.dto';
import { TeamListResponseDto } from '../dtos/team-response.dto';

@ApiTags('Team')
@ApiBearerAuth('jwt')
@ApiStandardResponses()
@Controller('team')
export class TeamController {
    constructor(
        private readonly listTeamsUseCase: ListTeamsUseCase,
        private readonly listTeamsWithIntegrationsUseCase: ListTeamsWithIntegrationsUseCase,
    ) {}

    @Get('/')
    @ApiOperation({
        summary: 'List teams',
        description: 'Return teams for the authenticated organization.',
    })
    @ApiOkResponse({ type: TeamListResponseDto })
    public async list() {
        return await this.listTeamsUseCase.execute();
    }

    @Get('/list-with-integrations')
    @ApiOperation({
        summary: 'List teams with integrations',
        description: 'Return teams and their integration status.',
    })
    @ApiOkResponse({ type: ApiArrayResponseDto })
    public async listWithIntegrations() {
        return await this.listTeamsWithIntegrationsUseCase.execute();
    }
}
