import { IsEmail, IsString, IsEnum } from 'class-validator';

import { AuthProvider } from '@libs/core/domain/enums/auth-provider.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserOrganizationOAuthDto {
    @IsString()
    @ApiProperty({ example: 'Jane Doe' })
    public name: string;

    @IsString()
    @IsEmail()
    @ApiProperty({ format: 'email', example: 'jane.doe@example.com' })
    public email: string;

    @IsString()
    @ApiProperty({ example: '{{oauthRefreshToken}}' })
    public refreshToken: string;

    @IsEnum(AuthProvider)
    @ApiProperty({
        enum: AuthProvider,
        enumName: 'AuthProvider',
        example: AuthProvider.GOOGLE,
    })
    public authProvider: AuthProvider;
}
