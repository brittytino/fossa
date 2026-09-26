import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GithubAccessTokenDTO {
    @IsString()
    @ApiProperty()
    code: string;
}
