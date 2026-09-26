import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { OrganizationModel } from './organization.model';

import { OrganizationParametersKey } from '@libs/core/domain/enums/organization-parameters-key.enum';
import { CoreModel } from '@libs/core/infrastructure/repositories/model/typeOrm';

@Entity('organization_parameters')
@Index('IDX_org_params_key_org', ['configKey', 'organization'], {
    concurrent: true,
})
@Index('IDX_org_params_config_value_gin', { synchronize: false }) // Typeorm does not support GIN indexes natively, so we set synchronize to false and create it manually in migrations
export class OrganizationParametersModel extends CoreModel {
    @Column({
        type: 'enum',
        enum: OrganizationParametersKey,
    })
    configKey: OrganizationParametersKey;

    @Column({ type: 'jsonb' })
    configValue: any;

    @ManyToOne(
        () => OrganizationModel,
        (organization) => organization.organizationParameters,
    )
    @JoinColumn({ name: 'organization_id', referencedColumnName: 'uuid' })
    organization: OrganizationModel;

    @Column({ nullable: true })
    description: string;
}
