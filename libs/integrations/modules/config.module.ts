import { forwardRef, Module } from '@nestjs/common';
import { IntegrationConfigCoreModule } from './config-core.module';

@Module({
    imports: [forwardRef(() => IntegrationConfigCoreModule)],
    exports: [forwardRef(() => IntegrationConfigCoreModule)],
})
export class IntegrationConfigModule {}
