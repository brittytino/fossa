import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import {
    ITeamAutomationRepository,
    TEAM_AUTOMATION_REPOSITORY_TOKEN,
} from '@libs/automation/domain/teamAutomation/contracts/team-automation.repository';
import { ITeamAutomationService } from '@libs/automation/domain/teamAutomation/contracts/team-automation.service';
import { TeamAutomationEntity } from '@libs/automation/domain/teamAutomation/entities/team-automation.entity';
import { ITeamAutomation } from '@libs/automation/domain/teamAutomation/interfaces/team-automation.interface';

@Injectable()
export class TeamAutomationService implements ITeamAutomationService {
    constructor(
        @Inject(TEAM_AUTOMATION_REPOSITORY_TOKEN)
        private readonly teamAutomationRepository: ITeamAutomationRepository,
    ) {}

    create(teamAutomation: ITeamAutomation): Promise<TeamAutomationEntity> {
        return this.teamAutomationRepository.create(teamAutomation);
    }

    update(
        filter: Partial<ITeamAutomation>,
        data: Partial<ITeamAutomation>,
    ): Promise<TeamAutomationEntity> {
        return this.teamAutomationRepository.update(filter, data);
    }

    delete(uuid: string): Promise<void> {
        return this.teamAutomationRepository.delete(uuid);
    }

    findById(uuid: string): Promise<TeamAutomationEntity> {
        return this.teamAutomationRepository.findById(uuid);
    }

    find(filter?: Partial<ITeamAutomation>): Promise<TeamAutomationEntity[]> {
        return this.teamAutomationRepository.find(filter);
    }

    register(
        teamAutomation: Omit<ITeamAutomation, 'uuid'>,
    ): Promise<TeamAutomationEntity> {
        return this.create({
            ...teamAutomation,
            uuid: uuidv4(),
        });
    }

    async hasActiveTeamAutomation(
        teamId: string,
        automation: string,
    ): Promise<boolean> {
        const teamAutomation = await this.find({
            status: true,
            team: { uuid: teamId },
        });

        if (!teamAutomation) {
            return false;
        }

        const hasAutomation = teamAutomation.find(
            (team) => team.automation.name === automation,
        );

        if (hasAutomation) {
            return true;
        }

        return false;
    }
}
