import { Module, forwardRef } from '@nestjs/common';
import { IntegrationCoreModule } from './integrations-core.module';

@Module({
    imports: [forwardRef(() => IntegrationCoreModule)],
    exports: [forwardRef(() => IntegrationCoreModule)],
})
export class IntegrationModule {}
