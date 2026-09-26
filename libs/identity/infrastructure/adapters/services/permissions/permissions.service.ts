import {
    IPermissionsRepository,
    PERMISSIONS_REPOSITORY_TOKEN,
} from '@libs/identity/domain/permissions/contracts/permissions.repository.contract';
import { IPermissionsService } from '@libs/identity/domain/permissions/contracts/permissions.service.contract';
import { IPermissions } from '@libs/identity/domain/permissions/types/permissions.types';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class PermissionsService implements IPermissionsService {
    constructor(
        @Inject(PERMISSIONS_REPOSITORY_TOKEN)
        private readonly permissionsRepository: IPermissionsRepository,
    ) {}

    create(
        permissions: Omit<IPermissions, 'uuid'>,
    ): Promise<IPermissions | null> {
        return this.permissionsRepository.create(permissions);
    }

    delete(uuid: string): Promise<void> {
        return this.permissionsRepository.delete(uuid);
    }

    find(filter: Partial<IPermissions>): Promise<IPermissions[]> {
        return this.permissionsRepository.find(filter);
    }

    findOne(filter: Partial<IPermissions>): Promise<IPermissions | null> {
        return this.permissionsRepository.findOne(filter);
    }

    update(
        uuid: string,
        permissions: Omit<Partial<IPermissions>, 'uuid'>,
    ): Promise<IPermissions | null> {
        return this.permissionsRepository.update(uuid, permissions);
    }
}
