import { Global, Module } from '@nestjs/common';
import { ObservabilityService } from '@libs/core/log/observability.service';

@Global()
@Module({
    providers: [ObservabilityService],
    exports: [ObservabilityService],
})
export class SharedObservabilityModule {}
