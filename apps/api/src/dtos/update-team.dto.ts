import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTeamDto {
    @IsString()
    @ApiProperty()
    teamName: string;

    @IsString()
    @ApiProperty()
    teamId: string;
}
