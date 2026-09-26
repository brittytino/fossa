import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TeamQueryDto {
    @IsString()
    @ApiProperty()
    readonly teamId: string;
}
