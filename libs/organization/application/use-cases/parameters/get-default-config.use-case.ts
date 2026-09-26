import { Injectable } from '@nestjs/common';

import { createLogger } from '@libs/core/log/logger';
import { getDefaultFossaConfigFile } from '@libs/common/utils/validateCodeReviewConfigFile';

@Injectable()
export class GetDefaultConfigUseCase {
    private readonly logger = createLogger(GetDefaultConfigUseCase.name);

    constructor() {}

    async execute() {
        try {
            return getDefaultFossaConfigFile();
        } catch (error) {
            this.logger.error({
                message: 'Error getting default Fossa config file',
                context: GetDefaultConfigUseCase.name,
                metadata: { error },
            });
            throw error;
        }
    }
}
