import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';

import { AutomationType } from '@libs/automation/domain/automation/enum/automation-type';
import { AutomationLevel } from '@libs/core/domain/enums';
import { CoreModel } from '@libs/core/infrastructure/repositories/model/typeOrm';

import type { TeamAutomationModel } from './teamAutomation.model';

@Entity('automation')
export class AutomationModel extends CoreModel {
    @Column()
    name: string;

    @Column()
    description: string;

    @Column('simple-array')
    tags: string[];

    @Column('simple-array')
    antiPatterns: string[];

    @Column({ type: 'boolean', default: true })
    status: boolean;

    @Column({ type: 'enum', enum: AutomationType, unique: true })
    automationType: AutomationType;

    @Column({
        type: 'enum',
        enum: AutomationLevel,
        default: AutomationLevel.TEAM,
    })
    level: AutomationLevel;

    @OneToMany('TeamAutomationModel', 'automation')
    @JoinColumn({ name: 'team_automation_id', referencedColumnName: 'uuid' })
    teamAutomations: TeamAutomationModel[];
}
