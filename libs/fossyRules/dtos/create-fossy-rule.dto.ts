import {
    IFossyRuleCentralizedConfig,
    IFossyRuleExternalReference,
    IFossyRuleReferenceSyncError,
    FossyRuleCentralizedStatus,
    IFossyRulesExample,
    FossyRuleProcessingStatus,
    FossyRuleRequestType,
    FossyRulesScope,
    FossyRulesOrigin,
    FossyRulesStatus,
    FossyRulesType,
} from '@libs/fossyRules/domain/interfaces/fossyRules.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

export enum FossyRuleSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export class FossyRulesExampleDto implements IFossyRulesExample {
    @IsString()
    @ApiProperty({ example: 'if (value == null) return;' })
    snippet: string;

    @IsBoolean()
    @ApiProperty({ example: true })
    isCorrect: boolean;
}

export class FossyRulesInheritanceDto {
    @IsBoolean()
    @ApiProperty({ example: true })
    inheritable: boolean;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @ApiPropertyOptional({
        type: String,
        isArray: true,
        example: ['src/legacy/**'],
    })
    exclude: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @ApiPropertyOptional({ type: String, isArray: true, example: ['src/**'] })
    include: string[];
}

export class FossyRuleExternalReferenceDto implements IFossyRuleExternalReference {
    @IsString()
    @ApiProperty({ example: 'src/services/user.service.ts' })
    filePath: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        example: 'Reference implementation in user service',
    })
    description?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: 'fossa-ai' })
    repositoryName?: string;
}

export class FossyRuleCentralizedConfigDto implements IFossyRuleCentralizedConfig {
    @IsString()
    @ApiProperty({ example: 'repo-a/.fossy-rules/review/no-debug.yml' })
    path: string;

    @IsEnum(FossyRuleCentralizedStatus)
    @ApiProperty({
        enum: FossyRuleCentralizedStatus,
        enumName: 'FossyRuleCentralizedStatus',
        example: FossyRuleCentralizedStatus.PENDING_EDIT,
    })
    status: FossyRuleCentralizedStatus;
}

export class CreateFossyRuleDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        format: 'uuid',
        example: '1e6f6a92-5b4b-4b7d-9c31-4f55f4e9cbd1',
    })
    uuid?: string;

    @IsNotEmpty()
    @IsEnum(FossyRulesType)
    @ApiProperty({
        enum: FossyRulesType,
        enumName: 'FossyRulesType',
        example: FossyRulesType.STANDARD,
    })
    type: FossyRulesType;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'Avoid null comparisons' })
    title: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        enum: FossyRulesScope,
        enumName: 'FossyRulesScope',
        example: FossyRulesScope.FILE,
    })
    scope?: FossyRulesScope;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example:
            'Avoid comparing to null; prefer strict checks or type guards.',
    })
    rule: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: 'src/services' })
    path: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: 'src/services/user.service.ts' })
    sourcePath?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => FossyRuleCentralizedConfigDto)
    @ApiPropertyOptional({ type: FossyRuleCentralizedConfigDto })
    centralizedConfig?: FossyRuleCentralizedConfigDto;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: 'L10-L24' })
    sourceAnchor?: string;

    @IsNotEmpty()
    @IsEnum(FossyRuleSeverity)
    @ApiProperty({ enum: FossyRuleSeverity, enumName: 'FossyRuleSeverity' })
    severity: FossyRuleSeverity;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        description:
            'Team identifier used to resolve team-scoped centralized configuration for global Fossy Rules.',
        example: '2e4f7a61-3c8c-4af5-bf25-2d0cbb19c4d1',
    })
    teamId?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: '1135722979' })
    repositoryId?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        description:
            'For global rules synced from a source repository, the id of that repository. Undefined for every other kind of rule.',
        example: '1135722979',
    })
    sourceRepositoryId?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        description:
            'Git blob SHA of the source file at last sync; used to short-circuit unchanged files on resync.',
    })
    lastContentHash?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: 'src/services' })
    directoryId?: string;

    @IsOptional()
    @IsEnum(FossyRulesOrigin)
    @ApiPropertyOptional({
        enum: FossyRulesOrigin,
        enumName: 'FossyRulesOrigin',
        description: 'Where the rule came from. Defaults to manual when omitted.',
    })
    origin?: FossyRulesOrigin;

    @IsEnum(FossyRulesStatus)
    @IsOptional()
    @ApiPropertyOptional({ enum: FossyRulesStatus, enumName: 'FossyRulesStatus' })
    status?: FossyRulesStatus;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FossyRulesExampleDto)
    @ApiPropertyOptional({ type: FossyRulesExampleDto, isArray: true })
    examples: FossyRulesExampleDto[];

    @IsOptional()
    @ValidateNested()
    @Type(() => FossyRulesInheritanceDto)
    @ApiPropertyOptional({ type: FossyRulesInheritanceDto })
    inheritance?: FossyRulesInheritanceDto;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FossyRuleExternalReferenceDto)
    @ApiPropertyOptional({ type: FossyRuleExternalReferenceDto, isArray: true })
    externalReferences?: FossyRuleExternalReferenceDto[];

    @IsOptional()
    @ApiPropertyOptional({
        type: Object,
        description: 'Reference sync errors returned by external sources.',
        additionalProperties: true,
    })
    syncErrors?: IFossyRuleReferenceSyncError[];

    @IsOptional()
    @IsEnum(FossyRuleProcessingStatus)
    @ApiPropertyOptional({
        enum: FossyRuleProcessingStatus,
        enumName: 'FossyRuleProcessingStatus',
    })
    referenceProcessingStatus?: FossyRuleProcessingStatus;

    @IsOptional()
    lastReferenceProcessedAt?: Date;

    @IsOptional()
    @IsString()
    ruleHash?: string;

    @IsOptional()
    @IsEnum(FossyRuleRequestType)
    @ApiPropertyOptional({
        enum: FossyRuleRequestType,
        enumName: 'FossyRuleRequestType',
    })
    requestType?: FossyRuleRequestType;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        format: 'uuid',
        description:
            'When this rule is a pending request, target rule to update',
    })
    targetRuleUuid?: string;

    @IsOptional()
    @ApiPropertyOptional({
        type: String,
        format: 'date-time',
    })
    @Type(() => Date)
    @IsDate()
    resolvedAt?: Date;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        description:
            'User id/email/system identifier that resolved the request',
    })
    resolvedBy?: string;

    @IsOptional()
    @IsBoolean()
    @ApiPropertyOptional({
        description:
            'True when the source file currently carries an `@fossy-sync` marker — the per-file override that keeps the rule in sync even with `ideRulesSyncEnabled=false`. Set by the sync service, recomputed on every sync.',
    })
    pinnedSync?: boolean;
}
