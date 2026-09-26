import { TeamEntity } from '@libs/organization/domain/team/entities/team.entity';

import { ITeamRepository } from './team.repository.contract';
import { TeamsFilter } from '../interfaces/team.interface';
import { TeamAutomationEntity } from '@libs/automation/domain/teamAutomation/entities/team-automation.entity';

export const TEAM_SERVICE_TOKEN = Symbol.for('TeamService');

export interface ITeamService extends ITeamRepository {
    findOneOrganizationIdByTeamId(id: string): Promise<string>;
    createTeam(body: {
        teamName: string;
        organizationId: string;
    }): Promise<TeamEntity | undefined>;
    findOneByOrganizationId(organizationId: string): Promise<TeamEntity>;
    findFirstCreatedTeam(
        organizationId: string,
    ): Promise<TeamEntity | undefined>;
    filterTeamAutomationsByConfiguredIntegrations(
        teamAutomations: TeamAutomationEntity[],
        teamsFilter: Partial<TeamsFilter>,
    ): Promise<TeamAutomationEntity[]>;
}
