import { createLogger } from '@libs/core/log/logger';
import {
    Inject,
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import {
    PULL_REQUESTS_REPOSITORY_TOKEN,
    IPullRequestsRepository,
} from '@libs/platformData/domain/pullRequests/contracts/pullRequests.repository';
import { ISuggestion } from '@libs/platformData/domain/pullRequests/interfaces/pullRequests.interface';
import {
    IFossyRulesService,
    FOSSY_RULES_SERVICE_TOKEN,
} from '@libs/fossyRules/domain/contracts/fossyRules.service.contract';

@Injectable()
export class FindSuggestionsByRuleUseCase {
    private readonly logger = createLogger(FindSuggestionsByRuleUseCase.name);
    constructor(
        @Inject(REQUEST)
        private readonly request: Request & {
            user: { organization: { uuid: string } };
        },
        @Inject(PULL_REQUESTS_REPOSITORY_TOKEN)
        private readonly pullRequestsRepository: IPullRequestsRepository,
        @Inject(FOSSY_RULES_SERVICE_TOKEN)
        private readonly fossyRulesService: IFossyRulesService,
    ) {}

    async execute(ruleId: string): Promise<ISuggestion[]> {
        try {
            if (!this.request.user.organization.uuid) {
                throw new BadRequestException('Organization ID not found');
            }

            if (!ruleId) {
                throw new BadRequestException('Rule ID is required');
            }

            const organizationId = this.request.user.organization.uuid;

            const existingRules =
                await this.fossyRulesService.findByOrganizationId(
                    organizationId,
                );

            if (!existingRules) {
                throw new NotFoundException(
                    'No Fossy rules found for the given organization ID',
                );
            }

            const rule = existingRules.rules.find(
                (rule) => rule.uuid === ruleId,
            );

            if (!rule) {
                throw new NotFoundException(
                    'Rule not found or does not belong to your organization',
                );
            }

            const suggestions =
                await this.pullRequestsRepository.findSuggestionsByRuleId(
                    ruleId,
                    organizationId,
                );

            if (!suggestions || suggestions.length === 0) {
                return [];
            }

            return suggestions;
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            this.logger.error({
                message: 'Error finding suggestions by rule ID',
                context: FindSuggestionsByRuleUseCase.name,
                error: error,
                metadata: {
                    ruleId,
                    organizationId: this.request.user.organization?.uuid,
                },
            });
            throw error;
        }
    }
}
