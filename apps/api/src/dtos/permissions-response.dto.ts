import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ApiResponseBaseDto } from './api-response.dto';

export class PermissionActionScopeDto {
    @ApiProperty({ format: 'uuid' })
    organizationId: string;
}

export class PermissionResourceDto {
    @ApiProperty({ type: PermissionActionScopeDto })
    manage: PermissionActionScopeDto;

    @ApiProperty({ type: PermissionActionScopeDto })
    create: PermissionActionScopeDto;

    @ApiProperty({ type: PermissionActionScopeDto })
    read: PermissionActionScopeDto;

    @ApiProperty({ type: PermissionActionScopeDto })
    update: PermissionActionScopeDto;

    @ApiProperty({ type: PermissionActionScopeDto })
    delete: PermissionActionScopeDto;
}

export class PermissionsResponseDto extends ApiResponseBaseDto {
    @ApiProperty({
        type: 'object',
        additionalProperties: { $ref: getSchemaPath(PermissionResourceDto) },
    })
    data: Record<string, PermissionResourceDto>;
}
