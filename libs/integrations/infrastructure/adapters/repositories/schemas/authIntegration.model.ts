import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { CoreModel } from '@libs/core/infrastructure/repositories/model/typeOrm';
import { OrganizationModel } from '@libs/organization/infrastructure/adapters/repositories/schemas/organization.model';
import { TeamModel } from '@libs/organization/infrastructure/adapters/repositories/schemas/team.model';

import type { IntegrationModel } from './integration.model';

@Entity('auth_integrations')
export class AuthIntegrationModel extends CoreModel {
    @Column({ type: 'jsonb' })
    authDetails: any;

    @Column({ type: 'boolean' })
    status: boolean;

    @OneToOne('IntegrationModel', 'authIntegration')
    integration: IntegrationModel;

    @ManyToOne(() => OrganizationModel)
    @JoinColumn({ name: 'organization_id', referencedColumnName: 'uuid' })
    organization: OrganizationModel;

    @ManyToOne(() => TeamModel, (team) => team.integrationConfigs)
    @JoinColumn({ name: 'team_id', referencedColumnName: 'uuid' })
    team: TeamModel;
}
