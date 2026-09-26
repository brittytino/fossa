import {
    Inject,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';

import { IUseCase } from '@libs/core/domain/interfaces/use-case.interface';
import {
    AUTH_SERVICE_TOKEN,
    IAuthService,
} from '@libs/identity/domain/auth/contracts/auth.service.contracts';
import {
    IUsersService,
    USER_SERVICE_TOKEN,
} from '@libs/identity/domain/user/contracts/user.service.contract';

interface DecodedPayload {
    readonly email: string;
}

@Injectable()
export class ResetPasswordUseCase implements IUseCase {
    constructor(
        @Inject(AUTH_SERVICE_TOKEN)
        private readonly authService: IAuthService,
        @Inject(USER_SERVICE_TOKEN)
        private readonly usersService: IUsersService,
    ) {}

    async execute(token: string, newPassword: string) {
        try {
            const decode: DecodedPayload =
                await this.authService.verifyForgotPassToken(token);
            if (!decode?.email) {
                throw new UnauthorizedException(
                    'Token does not contain user email',
                );
            }
            const password = await this.authService.hashPassword(
                newPassword,
                10,
            );
            await this.usersService.update(
                { email: decode.email },
                { password },
            );
            return { message: 'Password reset done' };
        } catch {
            return new InternalServerErrorException(
                'Something went wrong while resetting password',
            );
        }
    }
}
