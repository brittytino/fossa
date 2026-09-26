import { Type } from '@nestjs/common';

import { UserRequest } from '@libs/core/infrastructure/config/types/http/user-request.type';

import { AppAbility } from './permissions.types';

export interface IPolicyHandler {
    handle(
        ability: AppAbility,
        request?: UserRequest,
    ): Promise<boolean> | boolean;
}

export type PolicyHandlerCallback = (
    ability: AppAbility,
    request?: UserRequest,
) => Promise<boolean> | boolean;

export type PolicyHandler =
    | IPolicyHandler
    | PolicyHandlerCallback
    | Type<IPolicyHandler>;
