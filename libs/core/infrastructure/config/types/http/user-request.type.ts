import { Request } from 'express';

import { IUser } from '@libs/identity/domain/user/interfaces/user.interface';

type User = Partial<Omit<IUser, 'password'>>;

export type UserRequest = Request & { user: User };
