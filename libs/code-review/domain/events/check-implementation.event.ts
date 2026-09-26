import { OrganizationAndTeamData } from '@libs/core/infrastructure/config/types/general/organizationAndTeamData';

export class CheckImplementationEvent {
    constructor(
        public readonly organizationAndTeamData: OrganizationAndTeamData,
        public readonly repository: { id: string; name: string },
        public readonly pullRequestNumber: number,
        public readonly commitSha: string,
        public readonly trigger: 'synchronize' | 'synchronized' | 'closed',
    ) {}
}
