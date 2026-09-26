import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JiraAccessTokenDTO {
    @IsString()
    @ApiProperty()
    code: string;
}
