import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConversationDto {
    @IsString()
    @ApiProperty()
    public message: string;
}
