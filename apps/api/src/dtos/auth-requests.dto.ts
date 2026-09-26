import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
    @ApiProperty({ format: 'email', example: 'user@example.com' })
    email: string;

    @ApiProperty({ format: 'password', example: '{{password}}' })
    password: string;
}

export class LogoutRequestDto {
    @ApiProperty({ example: '{{refreshToken}}' })
    refreshToken: string;
}

export class RefreshTokenRequestDto {
    @ApiProperty({ example: '{{refreshToken}}' })
    refreshToken: string;
}

export class ForgotPasswordRequestDto {
    @ApiProperty({ format: 'email', example: 'user@example.com' })
    email: string;
}

export class ResetPasswordRequestDto {
    @ApiProperty({ example: '{{resetToken}}' })
    token: string;

    @ApiProperty({ format: 'password', example: '{{newPassword}}' })
    newPassword: string;
}

export class ConfirmEmailRequestDto {
    @ApiProperty({ example: '{{confirmationToken}}' })
    token: string;
}

export class ResendEmailRequestDto {
    @ApiProperty({ format: 'email', example: 'user@example.com' })
    email: string;
}
