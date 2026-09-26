import { Module } from '@nestjs/common';

import { CockpitModule } from '@libs/cockpit/modules/cockpit.module';
import { PermissionValidationModule } from '@libs/shared/infrastructure/permissions';
import { PlatformCoreModule } from '@libs/platform/modules/platform-core.module';

import {
    VERSION_CHECK_SERVICE_TOKEN,
    VersionCheckService,
} from '../services/version-check.service';
import { SelfHostedDoctorService } from './self-hosted-doctor.service';

@Module({
    imports: [
        PlatformCoreModule,
        PermissionValidationModule,
        CockpitModule,
    ],
    providers: [
        SelfHostedDoctorService,
        { provide: VERSION_CHECK_SERVICE_TOKEN, useClass: VersionCheckService },
    ],
    exports: [SelfHostedDoctorService],
})
export class SelfHostedDoctorModule {}
