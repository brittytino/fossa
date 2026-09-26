import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInfoOrganizationAndPhoneDto {
    @IsString()
    @IsNotEmpty({ message: 'The name field is required.' })
    @ApiProperty({ example: 'Fossa' })
    public name: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: '+55 11 99999-0000' })
    public phone?: string;
}
