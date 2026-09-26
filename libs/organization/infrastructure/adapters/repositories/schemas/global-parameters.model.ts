import { Column, Entity } from 'typeorm';

import { GlobalParametersKey } from '@libs/core/domain/enums/global-parameters-key.enum';
import { CoreModel } from '@libs/core/infrastructure/repositories/model/typeOrm';

@Entity('global_parameters')
export class GlobalParametersModel extends CoreModel {
    @Column({
        type: 'enum',
        enum: GlobalParametersKey,
    })
    configKey: GlobalParametersKey;

    @Column({ type: 'jsonb' })
    configValue: any;

    @Column({ nullable: true })
    description: string;
}
