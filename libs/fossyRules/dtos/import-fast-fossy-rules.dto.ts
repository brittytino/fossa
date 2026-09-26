import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FossyRulesScope } from '@libs/fossyRules/domain/interfaces/fossyRules.interface';
import { FossyRuleSeverity } from './create-fossy-rule.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ImportFastFossyRuleExampleDto {
    @ApiProperty({ example: 'if (value == null) return;' })
    snippet: string;

    @ApiProperty({ example: true })
    isCorrect: boolean;
}

class ImportFastFossyRuleItemDto {
    @ApiProperty({ example: 'Avoid null comparisons' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        example:
            'Avoid comparing to null; prefer strict checks or type guards.',
    })
    @IsString()
    @IsNotEmpty()
    rule: string;

    @ApiProperty({ example: 'src/services/user.service.ts' })
    @IsString()
    @IsNotEmpty()
    path: string;

    @ApiProperty({ example: 'src/services/user.service.ts' })
    @IsString()
    @IsNotEmpty()
    sourcePath: string;

    @ApiProperty({ example: '1135722979' })
    @IsString()
    @IsNotEmpty()
    repositoryId: string;

    @IsOptional()
    @IsEnum(FossyRuleSeverity)
    @ApiPropertyOptional({
        enum: FossyRuleSeverity,
        enumName: 'FossyRuleSeverity',
    })
    severity?: FossyRuleSeverity;

    @IsOptional()
    @IsEnum(FossyRulesScope)
    @ApiPropertyOptional({ enum: FossyRulesScope, enumName: 'FossyRulesScope' })
    scope?: FossyRulesScope;

    @ApiPropertyOptional({
        type: ImportFastFossyRuleExampleDto,
        isArray: true,
        description: 'Example snippets for the rule.',
    })
    @IsOptional()
    examples?: ImportFastFossyRuleExampleDto[];
}

export class ImportFastFossyRulesDto {
    @ApiProperty({
        format: 'uuid',
        example: 'c33ef663-70e7-4f43-9605-0bbef979b8e0',
    })
    @IsString()
    @IsNotEmpty()
    teamId: string;

    @ApiProperty({ type: ImportFastFossyRuleItemDto, isArray: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImportFastFossyRuleItemDto)
    rules: ImportFastFossyRuleItemDto[];
}
