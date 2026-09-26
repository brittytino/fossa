import { Module, forwardRef } from '@nestjs/common';

import { SuggestionEmbeddedModule } from './suggestionEmbedded.module';
import { GlobalParametersModule } from '@libs/organization/modules/global-parameters.module';
import { PlatformDataModule } from '@libs/platformData/platformData.module';
import { CodeReviewFeedbackModule } from '@libs/code-review/modules/codeReviewFeedback.module';

import { FossyFineTuningService } from './infrastructure/adapters/services/fossyFineTuning.service';
import { FossyFineTuningContextPreparationService } from './infrastructure/adapters/services/fineTuningContext/fine-tuning.service';
import { FOSSY_FINE_TUNING_CONTEXT_PREPARATION_TOKEN } from '@libs/core/domain/interfaces/fossy-fine-tuning-context-preparation.interface';

@Module({
    imports: [
        SuggestionEmbeddedModule,
        GlobalParametersModule,
        forwardRef(() => PlatformDataModule),
        forwardRef(() => CodeReviewFeedbackModule),
    ],
    providers: [
        FossyFineTuningService,
        {
            provide: FOSSY_FINE_TUNING_CONTEXT_PREPARATION_TOKEN,
            useClass: FossyFineTuningContextPreparationService,
        },
    ],
    exports: [
        FossyFineTuningService,
        FOSSY_FINE_TUNING_CONTEXT_PREPARATION_TOKEN,
    ],
})
export class FossyFineTuningContextModule {}
