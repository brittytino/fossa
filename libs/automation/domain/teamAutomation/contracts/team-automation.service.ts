import { ITeamAutomationRepository } from './team-automation.repository';
import { TeamAutomationEntity } from '../entities/team-automation.entity';
import { ITeamAutomation } from '../interfaces/team-automation.interface';

export const TEAM_AUTOMATION_SERVICE_TOKEN = Symbol.for(
    'TeamAutomationService',
);

export interface ITeamAutomationService extends ITeamAutomationRepository {
    register(
        teamAutomation: Omit<ITeamAutomation, 'uuid'>,
    ): Promise<TeamAutomationEntity>;
    hasActiveTeamAutomation(
        teamId: string,
        automation: string,
    ): Promise<boolean>;
}
