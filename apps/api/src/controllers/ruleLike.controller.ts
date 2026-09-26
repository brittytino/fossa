import { Body, Controller, Delete, Inject, Param, Post } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { UserRequest } from '@libs/core/infrastructure/config/types/http/user-request.type';
import { SetRuleFeedbackDto } from '../dtos/set-rule-feedback.dto';
import { SetRuleLikeUseCase } from '../../../../libs/fossyRules/application/use-cases/rule-like/set-rule-like.use-case';
import { RemoveRuleLikeUseCase } from '../../../../libs/fossyRules/application/use-cases/rule-like/remove-rule-like.use-case';
import {
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { ApiStandardResponses } from '../docs/api-standard-responses.decorator';
import { ApiBooleanResponseDto } from '../dtos/api-response.dto';
import { RuleLikeFeedbackResponseDto } from '../dtos/rule-like-response.dto';

@ApiTags('Rule Likes')
@ApiBearerAuth('jwt')
@ApiStandardResponses()
@Controller('rule-like')
export class RuleLikeController {
    constructor(
        private readonly setRuleLikeUseCase: SetRuleLikeUseCase,
        private readonly removeRuleLikeUseCase: RemoveRuleLikeUseCase,

        @Inject(REQUEST)
        private readonly request: UserRequest,
    ) {}

    @Post(':ruleId/feedback')
    @ApiOperation({
        summary: 'Submit rule feedback',
        description:
            'Creates or updates user feedback (positive/negative) for the specified rule.',
    })
    @ApiParam({ name: 'ruleId', required: true })
    @ApiBody({ type: SetRuleFeedbackDto })
    @ApiCreatedResponse({ type: RuleLikeFeedbackResponseDto })
    async setFeedback(
        @Param('ruleId') ruleId: string,
        @Body() body: SetRuleFeedbackDto,
    ) {
        if (!this.request.user?.uuid) {
            throw new Error('User not authenticated');
        }

        return this.setRuleLikeUseCase.execute(
            ruleId,
            body.feedback,
            this.request.user.uuid,
        );
    }

    @Delete(':ruleId/feedback')
    @ApiOperation({
        summary: 'Remove rule feedback',
        description: 'Removes user feedback for the specified rule.',
    })
    @ApiParam({ name: 'ruleId', required: true })
    @ApiOkResponse({ type: ApiBooleanResponseDto })
    async removeFeedback(@Param('ruleId') ruleId: string) {
        if (!this.request.user?.uuid) {
            throw new Error('User not authenticated');
        }

        return this.removeRuleLikeUseCase.execute(
            ruleId,
            this.request.user.uuid,
        );
    }
}
