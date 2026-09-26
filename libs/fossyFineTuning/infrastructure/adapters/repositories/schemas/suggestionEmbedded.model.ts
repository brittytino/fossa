import { CoreModel } from '@libs/core/infrastructure/repositories/model/typeOrm';
import { VectorColumn } from '@libs/core/infrastructure/repositories/model/typeOrm/columnType/vector.type';
import { OrganizationModel } from '@libs/organization/infrastructure/adapters/repositories/schemas/organization.model';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
@Entity('suggestion_embedded', {
    synchronize: false,
})
export class SuggestionEmbeddedModel extends CoreModel {
    @VectorColumn()
    suggestionEmbed: number[];

    @Column()
    pullRequestNumber: number;

    @Column()
    repositoryId: string;

    @Column()
    repositoryFullName: string;

    @Column()
    suggestionId: string;
    @Column()
    label: string;

    @Column()
    severity: string;

    @Column()
    feedbackType: string;

    @Column('text')
    improvedCode: string;

    @Column('text')
    suggestionContent: string;

    @Column({ nullable: true })
    language: string;

    @ManyToOne(() => OrganizationModel, (organization) => organization.teams)
    @JoinColumn({ name: 'organization_id', referencedColumnName: 'uuid' })
    organization: OrganizationModel;
}
