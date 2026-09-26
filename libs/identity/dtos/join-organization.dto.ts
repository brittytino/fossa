import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinOrganizationDto {
    @ApiProperty({
        format: 'uuid',
        description: 'User ID to join.',
        example: 'b771a2a0-5c7a-4e7f-8d5c-4a9a08f4cf62',
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        format: 'uuid',
        description: 'Organization ID to join.',
        example: '585e32e5-242e-4381-bef4-d2dfc61375f9',
    })
    @IsUUID()
    organizationId: string;
}
