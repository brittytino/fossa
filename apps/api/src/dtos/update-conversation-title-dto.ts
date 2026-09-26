import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConversationTitleDto {
    @IsString()
    @IsNotEmpty({ message: 'Title should not be empty' })
    @ApiProperty()
    public title: string;
}
