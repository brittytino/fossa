import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsStrongPassword,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AcceptUserInvitationDto {
    @ApiProperty({
        format: 'uuid',
        description: 'Invitation UUID.',
        example: '41d6b2bd-5db3-4b50-a5c6-2b1e5b0c6a9a',
    })
    @IsNotEmpty()
    public uuid: string;

    @ApiProperty({ example: 'Jane Doe' })
    @IsString()
    public name: string;

    @ApiProperty({
        format: 'password',
        example: 'Str0ngP@ssw0rd!',
    })
    @IsString()
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    public password: string;

    @ApiPropertyOptional({ example: '+1-555-0100' })
    @IsString()
    @IsOptional()
    public phone?: string;
}
