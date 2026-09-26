import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrganizationQueryDto {
    @IsString()
    @ApiProperty()
    readonly organizationId: string;
}
