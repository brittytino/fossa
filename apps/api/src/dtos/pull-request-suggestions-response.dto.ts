import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponseBaseDto } from './api-response.dto';

export class PullRequestSuggestionCommentDto {
    @ApiProperty()
    id: number | string;

    @ApiProperty()
    pullRequestReviewId: number | null;
}

export class PullRequestSuggestionDto {
    @ApiPropertyOptional()
    id?: string;

    @ApiPropertyOptional()
    suggestionContent?: string;

    @ApiPropertyOptional()
    oneSentenceSummary?: string;

    @ApiPropertyOptional()
    label?: string;

    @ApiPropertyOptional()
    severity?: string;

    @ApiPropertyOptional()
    deliveryStatus?: string;

    @ApiPropertyOptional()
    relevantLinesStart?: number;

    @ApiPropertyOptional()
    relevantLinesEnd?: number;

    @ApiPropertyOptional()
    existingCode?: string;

    @ApiPropertyOptional()
    improvedCode?: string;

    @ApiPropertyOptional()
    filePath?: string;

    @ApiPropertyOptional()
    createdAt?: string;

    @ApiPropertyOptional()
    updatedAt?: string;

    @ApiPropertyOptional({ type: PullRequestSuggestionCommentDto })
    comment?: PullRequestSuggestionCommentDto;
}

export class PullRequestSuggestionsGroupDto {
    @ApiProperty({ type: PullRequestSuggestionDto, isArray: true })
    files: PullRequestSuggestionDto[];

    @ApiProperty({ type: PullRequestSuggestionDto, isArray: true })
    prLevel: PullRequestSuggestionDto[];
}

export class PullRequestSuggestionsPayloadDto {
    @ApiProperty()
    prNumber: number;

    @ApiProperty()
    repositoryId: string;

    @ApiPropertyOptional()
    repositoryFullName?: string;

    @ApiProperty({
        description: 'Suggestions grouped by file and PR level.',
        type: PullRequestSuggestionsGroupDto,
    })
    suggestions: PullRequestSuggestionsGroupDto;
}

export class PullRequestSuggestionsResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: PullRequestSuggestionsPayloadDto })
    data: PullRequestSuggestionsPayloadDto;
}
