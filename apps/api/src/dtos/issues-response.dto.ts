import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponseBaseDto } from './api-response.dto';

export class IssueRepositoryDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    full_name: string;

    @ApiProperty()
    platform: string;

    @ApiPropertyOptional()
    url?: string;
}

export class IssueUserRefDto {
    @ApiProperty()
    gitId: string;

    @ApiProperty()
    username: string;
}

export class IssueDto {
    @ApiProperty({ format: 'uuid' })
    uuid: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    filePath: string;

    @ApiProperty()
    language: string;

    @ApiProperty()
    label: string;

    @ApiProperty()
    severity: string;

    @ApiProperty({
        type: Object,
        isArray: true,
        description:
            'List of contributing suggestions (shape varies by provider).',
    })
    contributingSuggestions: Record<string, unknown>[];

    @ApiProperty()
    status: string;

    @ApiProperty({ type: IssueRepositoryDto })
    repository: IssueRepositoryDto;

    @ApiProperty({ format: 'uuid' })
    organizationId: string;

    @ApiProperty()
    createdAt: string;

    @ApiProperty()
    updatedAt: string;

    @ApiPropertyOptional({ type: IssueUserRefDto })
    owner?: IssueUserRefDto;

    @ApiPropertyOptional({ type: IssueUserRefDto })
    reporter?: IssueUserRefDto;
}

export class IssueResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: IssueDto })
    data: IssueDto;
}

export class IssuesCountResponseDto extends ApiResponseBaseDto {
    @ApiProperty()
    data: number;
}
