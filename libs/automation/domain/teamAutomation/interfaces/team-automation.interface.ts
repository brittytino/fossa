import { ITeam } from '@libs/organization/domain/team/interfaces/team.interface';

import { IAutomation } from '../../automation/interfaces/automation.interface';

export interface ITeamAutomation {
    uuid?: string;
    status: boolean;
    automation?: Partial<IAutomation>;
    team?: Partial<ITeam>;
}
