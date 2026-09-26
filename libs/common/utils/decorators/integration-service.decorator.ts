import { SetMetadata } from '@nestjs/common';

import { PlatformType } from '@libs/core/domain/enums/platform-type.enum';

export const IntegrationServiceDecorator = (
    type: PlatformType,
    serviceType: 'codeManagement',
) => {
    return SetMetadata('integration', { type, serviceType });
};
