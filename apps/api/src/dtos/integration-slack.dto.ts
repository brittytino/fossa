import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IntegrationSlackDto {
    @IsString()
    @ApiProperty()
    public code: string;
}
