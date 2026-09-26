import { TeamQueryDto } from '@libs/organization/dtos/teamId-query.dto';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';

export class AutomationDto {
    @IsUUID()
    @IsNotEmpty()
    automationUuid: string;

    @IsString()
    @IsNotEmpty()
    automationType: string;

    @IsBoolean()
    @IsNotEmpty()
    status: boolean;
}

export class TeamAutomationsDto {
    @Type(() => TeamQueryDto)
    teamId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AutomationDto)
    automations: AutomationDto[];
}

export class OrganizationAutomationsDto {
    @Type(() => TeamQueryDto)
    organizationId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AutomationDto)
    automations: AutomationDto[];
}
