import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseBaseDto } from './api-response.dto';

export class AuthTokensDto {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;
}

export class AuthTokensResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: AuthTokensDto })
    data: AuthTokensDto;
}

export class AuthLogoutDetailsDto {
    @ApiProperty({ format: 'date-time' })
    expiresAt: string;

    @ApiProperty()
    refreshToken: string;
}

export class AuthLogoutResponseDataDto {
    @ApiProperty({ format: 'uuid' })
    uuid: string;

    @ApiProperty({ format: 'date-time' })
    createdAt: string;

    @ApiProperty({ format: 'date-time' })
    updatedAt: string;

    @ApiProperty()
    refreshToken: string;

    @ApiProperty({ format: 'date-time' })
    expiryDate: string;

    @ApiProperty()
    used: boolean;

    @ApiProperty({ type: AuthLogoutDetailsDto })
    authDetails: AuthLogoutDetailsDto;

    @ApiProperty()
    authProvider: string;
}

export class AuthLogoutResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: AuthLogoutResponseDataDto })
    data: AuthLogoutResponseDataDto;
}

export class AuthMessageDto {
    @ApiProperty()
    message: string;
}

export class AuthMessageResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: AuthMessageDto })
    data: AuthMessageDto;
}

export class AuthResetPasswordErrorDetailsDto {
    @ApiProperty()
    message: string;

    @ApiProperty()
    error: string;

    @ApiProperty()
    statusCode: number;
}

export class AuthResetPasswordErrorDataDto {
    @ApiProperty({ type: AuthResetPasswordErrorDetailsDto })
    response: AuthResetPasswordErrorDetailsDto;

    @ApiProperty()
    status: number;

    @ApiProperty({
        type: Object,
        description: 'Provider-specific error options.',
        additionalProperties: true,
    })
    options: Record<string, unknown>;

    @ApiProperty()
    message: string;

    @ApiProperty()
    name: string;
}

export class AuthResetPasswordResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: AuthResetPasswordErrorDataDto })
    data: AuthResetPasswordErrorDataDto;
}

export class AuthSsoCheckDataDto {
    @ApiProperty()
    active: boolean;

    @ApiProperty({ nullable: true })
    organizationId: string | null;
}

export class AuthSsoCheckResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: AuthSsoCheckDataDto })
    data: AuthSsoCheckDataDto;
}
