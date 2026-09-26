import { SeverityLevel } from '@libs/common/utils/enums/severityLevel.enum';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEnum,
    IsString,
    IsArray,
    ValidateNested,
    IsDefined,
} from 'class-validator';

class SourceFiltersDto {
    @IsBoolean()
    @ApiProperty({ type: Boolean })
    includeFossyRules: boolean;

    @IsBoolean()
    @ApiProperty({ type: Boolean })
    includeCodeReviewEngine: boolean;
}

class SeverityFiltersDto {
    @IsEnum(SeverityLevel)
    @ApiProperty({ enum: SeverityLevel, enumName: 'SeverityLevel' })
    minimumSeverity: SeverityLevel;

    @IsArray()
    @IsEnum(SeverityLevel, { each: true })
    @ApiProperty({ enum: SeverityLevel, enumName: 'SeverityLevel' })
    allowedSeverities: SeverityLevel[];
}

export class IssuesParameterDto {
    @IsBoolean()
    @ApiProperty({ type: Boolean })
    automaticCreationEnabled: boolean;

    @ValidateNested()
    @Type(() => SourceFiltersDto)
    @ApiProperty({ type: SourceFiltersDto })
    sourceFilters: SourceFiltersDto;

    @ValidateNested()
    @Type(() => SeverityFiltersDto)
    @ApiProperty({ type: SeverityFiltersDto })
    severityFilters: SeverityFiltersDto;
}

// required
export class OrganizationAndTeamDataDto {
    @IsString()
    @ApiProperty()
    teamId: string;

    @IsString()
    @ApiProperty()
    organizationId: string;
}

export class UpdateOrCreateIssuesParameterBodyDto {
    @ValidateNested()
    @Type(() => IssuesParameterDto)
    @ApiProperty({ type: IssuesParameterDto })
    configValue: IssuesParameterDto;

    @IsDefined()
    @ValidateNested()
    @Type(() => OrganizationAndTeamDataDto)
    @ApiProperty({ type: OrganizationAndTeamDataDto })
    organizationAndTeamData: OrganizationAndTeamDataDto;
}
