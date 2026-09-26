import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

import { STATUS } from '@libs/core/infrastructure/config/types/database/status.type';
import { Role } from '@libs/identity/domain/permissions/enums/permissions.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    @IsEmail()
    @ApiPropertyOptional({ format: 'email' })
    email?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    password?: string;

    @IsOptional()
    @IsEnum(STATUS)
    @ApiPropertyOptional({ enum: STATUS, enumName: 'STATUS' })
    status?: STATUS;

    @IsOptional()
    @IsEnum(Role)
    @ApiPropertyOptional({ enum: Role, enumName: 'Role' })
    role?: Role;
}
