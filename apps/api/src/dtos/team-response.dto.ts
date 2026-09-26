import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseBaseDto } from './api-response.dto';

export class TeamSummaryDto {
    @ApiProperty({ format: 'uuid' })
    uuid: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    status: string;

    @ApiProperty({
        nullable: true,
        type: Object,
        description: 'CLI configuration for the team (schema varies).',
        additionalProperties: true,
    })
    cliConfig: Record<string, unknown> | null;
}

export class TeamListResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: TeamSummaryDto, isArray: true })
    data: TeamSummaryDto[];
}

export class TeamMembersListDto {
    @ApiProperty({
        type: Object,
        isArray: true,
        description: 'Team members list (schema varies by provider).',
    })
    members: Record<string, unknown>[];
}

export class TeamMembersResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: TeamMembersListDto })
    data: TeamMembersListDto;
}

export class TeamMemberInviteResultDto {
    @ApiProperty()
    email: string;

    @ApiProperty()
    status: string;

    @ApiProperty()
    message: string;

    @ApiProperty({ nullable: true })
    uuid?: string;
}

export class TeamMembersUpsertDataDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ type: TeamMemberInviteResultDto, isArray: true })
    results: TeamMemberInviteResultDto[];
}

export class TeamMembersUpsertResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: TeamMembersUpsertDataDto })
    data: TeamMembersUpsertDataDto;
}
