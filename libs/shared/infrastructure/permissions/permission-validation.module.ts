import { Module, forwardRef } from '@nestjs/common';
import { OrganizationParametersModule } from '@libs/organization/modules/organizationParameters.module';
import { PermissionValidationService } from './services/permission-validation.service';
import { FossaLicenseService } from './services/fossa-license.service';
import { LICENSE_SERVICE_TOKEN } from './interfaces/license.interface';
import { AutoAssignLicenseUseCase } from './use-cases/auto-assign-license.use-case';

@Module({
    imports: [
        forwardRef(() => OrganizationParametersModule),
    ],
    providers: [
        PermissionValidationService,
        AutoAssignLicenseUseCase,
        {
            provide: LICENSE_SERVICE_TOKEN,
            useClass: FossaLicenseService,
        },
        FossaLicenseService,
    ],
    exports: [
        PermissionValidationService,
        AutoAssignLicenseUseCase,
        LICENSE_SERVICE_TOKEN,
        FossaLicenseService,
    ],
})
export class PermissionValidationModule {}
