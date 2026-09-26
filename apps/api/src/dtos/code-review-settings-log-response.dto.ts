import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseBaseDto } from './api-response.dto';

export class CodeReviewSettingsLogUserInfoDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    userEmail: string;
}

export class CodeReviewSettingsLogRepositoryDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ required: false })
    name?: string;
}

export class CodeReviewSettingsLogDirectoryDto {
    @ApiProperty({ required: false })
    id?: string | null;

    @ApiProperty({ required: false })
    path?: string | null;
}

export class CodeReviewSettingsLogChangeDto {
    @ApiProperty()
    actionDescription: string;

    @ApiProperty({
        type: Object,
        required: false,
        description: 'Previous parameter value (schema varies by key).',
        additionalProperties: true,
    })
    previousValue?: Record<string, unknown> | null;

    @ApiProperty({
        type: Object,
        required: false,
        description: 'Current parameter value (schema varies by key).',
        additionalProperties: true,
    })
    currentValue?: Record<string, unknown> | null;

    @ApiProperty({ required: false })
    description?: string;
}

export class CodeReviewSettingsLogEntryDto {
    @ApiProperty()
    _uuid: string;

    @ApiProperty()
    _organizationId: string;

    @ApiProperty({ required: false })
    _teamId?: string;

    @ApiProperty()
    _action: string;

    @ApiProperty()
    _configLevel: string;

    @ApiProperty({ type: CodeReviewSettingsLogUserInfoDto })
    _userInfo: CodeReviewSettingsLogUserInfoDto;

    @ApiProperty({ type: CodeReviewSettingsLogRepositoryDto, required: false })
    _repository?: CodeReviewSettingsLogRepositoryDto;

    @ApiProperty({ type: CodeReviewSettingsLogDirectoryDto, required: false })
    _directory?: CodeReviewSettingsLogDirectoryDto;

    @ApiProperty({ type: CodeReviewSettingsLogChangeDto, isArray: true })
    _changedData: CodeReviewSettingsLogChangeDto[];

    @ApiProperty()
    _createdAt: string;

    @ApiProperty()
    _updatedAt: string;
}

export class CodeReviewSettingsLogDataDto {
    @ApiProperty({ type: CodeReviewSettingsLogEntryDto, isArray: true })
    logs: CodeReviewSettingsLogEntryDto[];

    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    totalPages: number;
}

export class CodeReviewSettingsLogResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: CodeReviewSettingsLogDataDto })
    data: CodeReviewSettingsLogDataDto;
}
