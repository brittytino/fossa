import { TeamCliKeyEntity } from '../entities/team-cli-key.entity';
import { ITeamCliKey } from '../interfaces/team-cli-key.interface';

export const TEAM_CLI_KEY_REPOSITORY_TOKEN = Symbol.for('TeamCliKeyRepository');

export interface ITeamCliKeyRepository {
    find(filter?: Partial<ITeamCliKey>): Promise<TeamCliKeyEntity[]>;
    findOne(
        filter: Partial<ITeamCliKey>,
    ): Promise<TeamCliKeyEntity | undefined>;
    findById(uuid: string): Promise<TeamCliKeyEntity | undefined>;
    findByTeamId(teamId: string): Promise<TeamCliKeyEntity[]>;
    create(data: Partial<ITeamCliKey>): Promise<TeamCliKeyEntity | undefined>;
    update(
        filter: Partial<ITeamCliKey>,
        data: Partial<ITeamCliKey>,
    ): Promise<TeamCliKeyEntity | undefined>;
    delete(uuid: string): Promise<void>;
}
