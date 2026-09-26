import { MongoAbility } from '@casl/ability';

import { Action, ResourceType } from '../enums/permissions.enum';

export type Subject = ResourceType | 'all';

export type AppAbility = MongoAbility<[Action, Subject]>; // has nothing to do with mongo as a database

// TUser allows injecting the User type without importing the file, breaking circular dependency
export type IPermissions<TUser = any> = {
    uuid: string;
    permissions: {
        assignedRepositoryIds: string[]; // list of repository IDs assigned to the user
    };
    user: Partial<TUser>;
};
