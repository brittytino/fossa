import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
    @IsString()
    @MinLength(3)
    @ApiProperty()
    public prompt: string;

    @IsString()
    @ApiProperty()
    public teamId: string;
}
