import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

import { ProfileConfigModel } from './profileConfig.model';
import type { UserModel } from './user.model';

import { CoreModel } from '@libs/core/infrastructure/repositories/model/typeOrm';

@Entity('profiles')
export class ProfileModel extends CoreModel {
    @Column()
    name: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    img: string;

    @Column({ nullable: true })
    position: string;

    @Column({ default: true })
    public status: boolean;

    @Column({ nullable: true })
    referralSource: string;

    @Column({ nullable: true })
    primaryGoal: string;

    @OneToOne('UserModel', 'profile')
    @JoinColumn({ name: 'user_id', referencedColumnName: 'uuid' })
    user: UserModel;

    @OneToMany('ProfileConfigModel', 'profile')
    profileConfigs: ProfileConfigModel[];
}
