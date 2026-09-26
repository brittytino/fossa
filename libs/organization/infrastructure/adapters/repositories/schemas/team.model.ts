import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';

import type { TeamAutomationModel } from '@libs/automation/infrastructure/adapters/repositories/schemas/teamAutomation.model';
import type { AuthIntegrationModel } from '@libs/integrations/infrastructure/adapters/repositories/schemas/authIntegration.model';
import type { IntegrationModel } from '@libs/integrations/infrastructure/adapters/repositories/schemas/integration.model';
import type { IntegrationConfigModel } from '@libs/integrations/infrastructure/adapters/repositories/schemas/integrationConfig.model';
import type { OrganizationModel } from '@libs/organization/infrastructure/adapters/repositories/schemas/organization.model';
import type { ParametersModel } from '@libs/organization/infrastructure/adapters/repositories/schemas/parameters.model';
import type { TeamMemberModel } from '@libs/organization/infrastructure/adapters/repositories/schemas/teamMember.model';

import { STATUS } from '@libs/core/infrastructure/config/types/database/status.type';
import { CoreModel } from '@libs/core/infrastructure/repositories/model/typeOrm';

@Entity('teams')
@Index('IDX_teams_org_status', ['organization', 'status'], { concurrent: true })
@Index('IDX_teams_org_created', ['organization', 'createdAt'], {
    concurrent: true,
})
@Index('IDX_teams_status', ['status'], { concurrent: true })
export class TeamModel extends CoreModel {
    @Column()
    name: string;

    @Column({ type: 'enum', enum: STATUS, default: STATUS.PENDING })
    status: STATUS;

    @ManyToOne('OrganizationModel', 'teams')
    @JoinColumn({ name: 'organization_id', referencedColumnName: 'uuid' })
    organization: OrganizationModel;

    @OneToMany('TeamAutomationModel', 'team')
    @JoinColumn({ name: 'team_id', referencedColumnName: 'uuid' })
    teamAutomations: TeamAutomationModel[];

    @OneToMany('AuthIntegrationModel', 'team')
    authIntegration: AuthIntegrationModel[];

    @OneToMany('IntegrationModel', 'team')
    integration: IntegrationModel[];

    @OneToMany('IntegrationConfigModel', 'team')
    integrationConfigs: IntegrationConfigModel[];

    @OneToMany('ParametersModel', 'team')
    parameters: ParametersModel[];

    @OneToMany('TeamMemberModel', 'team')
    teamMember: TeamMemberModel[];

    @Column({ type: 'jsonb', nullable: true })
    cliConfig?: any;
}
