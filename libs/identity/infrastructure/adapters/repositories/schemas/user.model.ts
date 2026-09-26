import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
} from 'typeorm';

import type { AuthModel } from './auth.model';
import type { OrganizationModel } from '@libs/organization/infrastructure/adapters/repositories/schemas/organization.model';
import type { PermissionsModel } from './permissions.model';
import type { ProfileModel } from './profile.model';
import type { TeamMemberModel } from '@libs/organization/infrastructure/adapters/repositories/schemas/teamMember.model';

import { STATUS } from '@libs/core/infrastructure/config/types/database/status.type';
import { Role } from '@libs/identity/domain/permissions/enums/permissions.enum';
import { CoreModel } from '@libs/core/infrastructure/repositories/model/typeOrm';

@Entity('users')
@Index('IDX_users_email', ['email'], { concurrent: true })
@Index('IDX_users_org_status', ['organization', 'status'], { concurrent: true })
export class UserModel extends CoreModel {
    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ name: 'password', nullable: false })
    password: string;

    @Column({ type: 'enum', enum: Role, default: Role.OWNER })
    role: Role;

    @Column({ type: 'enum', enum: STATUS, default: STATUS.PENDING })
    status: STATUS;

    @OneToOne('ProfileModel', 'user')
    profile: ProfileModel[];

    @ManyToOne('OrganizationModel', 'users')
    @JoinColumn({ name: 'organization_id', referencedColumnName: 'uuid' })
    organization: OrganizationModel;

    @OneToMany('AuthModel', 'user')
    auth: AuthModel[];

    @OneToMany('TeamMemberModel', 'user')
    teamMember: TeamMemberModel[];

    @OneToOne('PermissionsModel', 'user')
    permissions: PermissionsModel;
}
