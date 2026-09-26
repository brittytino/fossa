import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class updatePullRequestDto {
    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    public teamId?: string;

    @IsString()
    @ApiProperty()
    public organizationId: string;
}
