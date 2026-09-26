import { Module } from '@nestjs/common';
import { IssuesCoreModule } from './issues-core.module';

@Module({
    imports: [IssuesCoreModule],
    exports: [IssuesCoreModule],
})
export class IssuesModule {}
