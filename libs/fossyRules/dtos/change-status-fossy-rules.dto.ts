import { FossyRulesStatus } from '@libs/fossyRules/domain/interfaces/fossyRules.interface';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeStatusFossyRulesDTO {
    @IsOptional()
    @IsString()
    @ApiProperty({
        type: String,
        required: false,
        example: 'team_123',
    })
    teamId?: string;

    @IsArray()
    @IsString({ each: true })
    @ApiProperty({
        type: String,
        isArray: true,
        example: ['rule_123', 'rule_456'],
    })
    ruleIds: string[];

    @IsEnum(FossyRulesStatus)
    @ApiProperty({
        enum: FossyRulesStatus,
        enumName: 'FossyRulesStatus',
        example: FossyRulesStatus.ACTIVE,
    })
    status: FossyRulesStatus;
}
