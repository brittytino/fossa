import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class OrganizationAndTeamDataDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        format: 'uuid',
        example: 'c33ef663-70e7-4f43-9605-0bbef979b8e0',
    })
    teamId?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        format: 'uuid',
        example: '585e32e5-242e-4381-bef4-d2dfc61375f9',
    })
    organizationId?: string;
}
