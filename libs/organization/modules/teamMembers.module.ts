import { Module } from '@nestjs/common';
import { TeamMembersCoreModule } from './teamMembers-core.module';

@Module({
    imports: [TeamMembersCoreModule],
    exports: [TeamMembersCoreModule],
})
export class TeamMembersModule {}
