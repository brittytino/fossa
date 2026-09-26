import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewFastFossyRulesDto {
    @IsString()
    @ApiProperty({ example: 'c33ef663-70e7-4f43-9605-0bbef979b8e0' })
    teamId: string;

    @IsOptional()
    @IsArray()
    @ApiPropertyOptional({
        type: String,
        isArray: true,
        example: ['rule_123', 'rule_456'],
    })
    activateRuleIds?: string[];

    @IsOptional()
    @IsArray()
    @ApiPropertyOptional({
        type: String,
        isArray: true,
        example: ['rule_789'],
    })
    deleteRuleIds?: string[];
}
