import { AutomationType } from '@libs/automation/domain/automation/enum/automation-type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';

export class AutomationRunDto {
    @IsEnum(AutomationType)
    @ApiProperty({ enum: AutomationType, enumName: 'AutomationType' })
    automationName: AutomationType;

    @IsNotEmpty()
    @IsUUID()
    @ApiProperty()
    teamId: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    channelId?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    organizationId?: string;
}
