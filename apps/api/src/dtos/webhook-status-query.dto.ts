import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookStatusQueryDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly organizationId: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly teamId: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly repositoryId: string;
}
