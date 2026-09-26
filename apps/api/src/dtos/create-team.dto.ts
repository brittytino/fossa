import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
    @IsString()
    @ApiProperty()
    teamName: string;

    @IsString()
    @ApiProperty()
    organizationId: string;
}
