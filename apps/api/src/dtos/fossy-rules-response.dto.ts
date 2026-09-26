import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponseBaseDto } from './api-response.dto';

export class FossyRulesLimitDto {
    @ApiProperty()
    total: number;
}

export class FossyRulesLimitResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: FossyRulesLimitDto })
    data: FossyRulesLimitDto;
}

export class FossyRulesSyncStatusDto {
    @ApiProperty()
    ideRulesSyncEnabledFirstTime: boolean;

    @ApiProperty()
    fossyRulesGeneratorEnabledFirstTime: boolean;
}

export class FossyRulesSyncStatusResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: FossyRulesSyncStatusDto })
    data: FossyRulesSyncStatusDto;
}

export class FossyRulesBucketDto {
    @ApiProperty()
    slug: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    rulesCount: number;
}

export class FossyRulesBucketsResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: FossyRulesBucketDto, isArray: true })
    data: FossyRulesBucketDto[];
}

export class FossyRulesExampleDto {
    @ApiProperty()
    snippet: string;

    @ApiProperty()
    isCorrect: boolean;
}

export class FossyRulesLibraryRuleDto {
    @ApiProperty()
    title: string;

    @ApiProperty()
    rule: string;

    @ApiProperty()
    why_is_this_important: string;

    @ApiProperty()
    severity: string;

    @ApiProperty()
    bad_example: string;

    @ApiProperty()
    good_example: string;

    @ApiProperty({ type: FossyRulesExampleDto, isArray: true })
    examples: FossyRulesExampleDto[];

    @ApiProperty()
    language: string;

    @ApiProperty({ format: 'uuid' })
    uuid: string;

    @ApiProperty({ type: String, isArray: true })
    buckets: string[];

    @ApiProperty()
    scope: string;

    @ApiProperty()
    plug_and_play: boolean;

    @ApiProperty()
    positiveCount: number;

    @ApiProperty()
    negativeCount: number;

    @ApiProperty({
        nullable: true,
        type: Object,
        description: 'Optional user feedback metadata (provider-specific).',
        additionalProperties: true,
    })
    userFeedback: Record<string, unknown> | null;
}

export class FossyRulesPaginationDto {
    @ApiProperty()
    currentPage: number;

    @ApiProperty()
    totalPages: number;

    @ApiProperty()
    totalItems: number;

    @ApiProperty()
    itemsPerPage: number;

    @ApiProperty()
    hasNextPage: boolean;

    @ApiProperty()
    hasPreviousPage: boolean;
}

export class FossyRulesLibraryDataDto {
    @ApiProperty({ type: FossyRulesLibraryRuleDto, isArray: true })
    data: FossyRulesLibraryRuleDto[];

    @ApiProperty({ type: FossyRulesPaginationDto })
    pagination: FossyRulesPaginationDto;
}

export class FossyRulesLibraryResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: FossyRulesLibraryDataDto })
    data: FossyRulesLibraryDataDto;
}

export class FossyRuleInheritanceDto {
    @ApiProperty()
    inheritable: boolean;

    @ApiProperty({ type: String, isArray: true })
    exclude: string[];

    @ApiProperty({ type: String, isArray: true })
    include: string[];
}

export class FossyRuleExternalReferenceDto {
    @ApiProperty()
    filePath: string;

    @ApiProperty({ nullable: true })
    description?: string;

    @ApiProperty({ nullable: true })
    repositoryName?: string;
}

export class FossyRuleSyncErrorDto {
    @ApiProperty()
    type: string;

    @ApiProperty({ nullable: true })
    message?: string;

    @ApiProperty({
        type: Object,
        description: 'Provider-specific error details.',
        additionalProperties: true,
    })
    details: Record<string, unknown>;
}

export class FossyRuleDto {
    @ApiProperty({ format: 'uuid' })
    uuid: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    rule: string;

    @ApiProperty({ nullable: true })
    path?: string | null;

    @ApiProperty({ nullable: true })
    sourcePath?: string | null;

    @ApiProperty({ nullable: true })
    sourceAnchor?: string | null;

    @ApiProperty()
    severity: string;

    @ApiProperty()
    status: string;

    @ApiProperty({ nullable: true })
    repositoryId?: string | null;

    @ApiProperty({ nullable: true })
    directoryId?: string | null;

    @ApiProperty({ type: FossyRulesExampleDto, isArray: true, nullable: true })
    examples?: FossyRulesExampleDto[] | null;

    @ApiPropertyOptional({
        description:
            'Explicit provenance (manual, library, past_reviews, repo_file_sync, onboarding_repo_analysis, mcp_agent, cli).',
    })
    origin?: string;

    @ApiProperty()
    scope: string;

    @ApiProperty({ type: FossyRuleInheritanceDto })
    inheritance: FossyRuleInheritanceDto;

    @ApiProperty()
    createdAt: string;

    @ApiProperty()
    updatedAt: string;

    @ApiPropertyOptional()
    referenceProcessingStatus?: string | null;

    @ApiProperty({ type: FossyRuleExternalReferenceDto, isArray: true })
    externalReferences: FossyRuleExternalReferenceDto[];

    @ApiProperty({ type: FossyRuleSyncErrorDto, isArray: true })
    syncErrors: FossyRuleSyncErrorDto[];

    @ApiPropertyOptional({
        description:
            'True when the source file currently carries an `@fossy-sync` marker — the per-file override that keeps the rule synced even with the repo `ideRulesSyncEnabled=false`. Surfaced so the UI can exclude such rules from the orphan chip and bulk pause/delete actions.',
    })
    pinnedSync?: boolean;

    @ApiPropertyOptional({
        description:
            'True when this rule is PAUSED because activating it would exceed the free plan\'s active-rule quota, rather than a user-initiated pause. The web UI renders these as "Locked" with an upgrade CTA instead of a plain resume toggle.',
    })
    lockedByPlan?: boolean;
}

export class FossyRuleResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: FossyRuleDto })
    data: FossyRuleDto;
}

export class FossyRulesArrayResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: FossyRuleDto, isArray: true })
    data: FossyRuleDto[];
}

export class FossyRulesPendingCountsDto {
    @ApiProperty()
    total: number;

    @ApiProperty()
    rules: number;

    @ApiProperty()
    memories: number;
}

export class FossyRulesPendingDataDto {
    @ApiProperty({ type: FossyRuleDto, isArray: true })
    items: FossyRuleDto[];

    @ApiProperty({ type: FossyRulesPendingCountsDto })
    counts: FossyRulesPendingCountsDto;
}

export class FossyRulesPendingResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: FossyRulesPendingDataDto })
    data: FossyRulesPendingDataDto;
}

export class FossyRulesFindByOrgDataDto {
    @ApiProperty()
    _uuid: string;

    @ApiProperty()
    _organizationId: string;

    @ApiProperty({ type: FossyRuleDto, isArray: true })
    _rules: FossyRuleDto[];

    @ApiProperty()
    _createdAt: string;

    @ApiProperty()
    _updatedAt: string;
}

export class FossyRulesFindByOrgResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: FossyRulesFindByOrgDataDto })
    data: FossyRulesFindByOrgDataDto;
}

export class FossyRulesFastSyncDataDto {
    @ApiProperty({ type: FossyRuleDto, isArray: true })
    rules: FossyRuleDto[];

    @ApiProperty({ type: String, isArray: true })
    skippedFiles: string[];

    @ApiProperty({
        type: Object,
        isArray: true,
        description: 'Sync errors (provider-specific shape).',
    })
    errors: Record<string, unknown>[];
}

export class FossyRulesFastSyncResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: FossyRulesFastSyncDataDto })
    data: FossyRulesFastSyncDataDto;
}

export class FossyRulesInheritedDataDto {
    @ApiProperty({ type: FossyRuleDto, isArray: true })
    globalRules: FossyRuleDto[];

    @ApiProperty({ type: FossyRuleDto, isArray: true })
    repoRules: FossyRuleDto[];

    @ApiProperty({ type: FossyRuleDto, isArray: true })
    directoryRules: FossyRuleDto[];
}

export class FossyRulesInheritedResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: FossyRulesInheritedDataDto })
    data: FossyRulesInheritedDataDto;
}
