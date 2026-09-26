import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
    @IsString()
    @IsEmail()
    @ApiProperty({ format: 'email' })
    public email: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    public password: string;

    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional({ type: Boolean })
    public status?: boolean;
}
