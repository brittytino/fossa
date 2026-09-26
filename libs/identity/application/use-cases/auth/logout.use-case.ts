import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { IUseCase } from '@libs/core/domain/interfaces/use-case.interface';
import {
    AUTH_SERVICE_TOKEN,
    IAuthService,
} from '@libs/identity/domain/auth/contracts/auth.service.contracts';

@Injectable()
export class LogoutUseCase implements IUseCase {
    constructor(
        @Inject(AUTH_SERVICE_TOKEN)
        private readonly authService: IAuthService,
    ) {}

    async execute(refreshToken: string) {
        try {
            return await this.authService.logout(refreshToken);
        } catch {
            throw new UnauthorizedException('api.users.unauthorized');
        }
    }
}
