import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseBaseDto } from './api-response.dto';

export class UserOrganizationDto {
    @ApiProperty({ format: 'uuid' })
    uuid: string;

    @ApiProperty({ format: 'date-time' })
    createdAt: string;

    @ApiProperty({ format: 'date-time' })
    updatedAt: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    tenantName: string;

    @ApiProperty()
    status: boolean;
}

export class UserTeamDto {
    @ApiProperty({ format: 'uuid' })
    uuid: string;

    @ApiProperty({ format: 'date-time' })
    createdAt: string;

    @ApiProperty({ format: 'date-time' })
    updatedAt: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    status: string;

    @ApiProperty({
        type: Object,
        nullable: true,
        description: 'CLI configuration for the team (schema varies).',
        additionalProperties: true,
    })
    cliConfig: Record<string, unknown> | null;
}

export class TeamMemberDto {
    @ApiProperty({ format: 'uuid' })
    uuid: string;

    @ApiProperty({ format: 'date-time' })
    createdAt: string;

    @ApiProperty({ format: 'date-time' })
    updatedAt: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    status: boolean;

    @ApiProperty({
        nullable: true,
        type: Object,
        description: 'Avatar metadata (provider-specific).',
        additionalProperties: true,
    })
    avatar: Record<string, unknown> | null;

    @ApiProperty({
        nullable: true,
        type: Object,
        description: 'Communication integration metadata.',
        additionalProperties: true,
    })
    communication: Record<string, unknown> | null;

    @ApiProperty({
        nullable: true,
        type: Object,
        description: 'Code management integration metadata.',
        additionalProperties: true,
    })
    codeManagement: Record<string, unknown> | null;

    @ApiProperty({
        nullable: true,
        type: Object,
        description: 'Project management integration metadata.',
        additionalProperties: true,
    })
    projectManagement: Record<string, unknown> | null;

    @ApiProperty({
        nullable: true,
        type: Object,
        description: 'Communication integration identifier details.',
        additionalProperties: true,
    })
    communicationId: Record<string, unknown> | null;

    @ApiProperty()
    teamRole: string;

    @ApiProperty({ type: UserOrganizationDto })
    organization: UserOrganizationDto;

    @ApiProperty({ type: UserTeamDto })
    team: UserTeamDto;
}

export class UserInfoDto {
    @ApiProperty({ format: 'uuid' })
    uuid: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    role: string;

    @ApiProperty({ type: UserOrganizationDto })
    organization: UserOrganizationDto;

    @ApiProperty()
    status: string;

    @ApiProperty({ type: TeamMemberDto, isArray: true })
    teamMember: TeamMemberDto[];

    @ApiProperty({
        nullable: true,
        type: Object,
        description: 'Permission map for the current user.',
        additionalProperties: true,
    })
    permissions: Record<string, unknown> | null;
}

export class UserInfoResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: UserInfoDto })
    data: UserInfoDto;
}

export class UserUpdateDto {
    @ApiProperty({ format: 'uuid' })
    uuid: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    role: string;

    @ApiProperty()
    status: string;
}

export class UserUpdateResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: UserUpdateDto })
    data: UserUpdateDto;
}
