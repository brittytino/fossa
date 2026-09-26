import { createLogger } from '@libs/core/log/logger';
import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { FindLibraryFossyRulesDto } from '@libs/core/domain/dtos/find-library-fossy-rules.dto';
import {
    PaginatedLibraryFossyRulesResponse,
    PaginationMetadata,
} from '@libs/core/domain/dtos/paginated-library-fossy-rules.dto';
import {
    IFossyRulesService,
    FOSSY_RULES_SERVICE_TOKEN,
} from '@libs/fossyRules/domain/contracts/fossyRules.service.contract';

@Injectable()
export class FindLibraryFossyRulesWithFeedbackUseCase {
    private readonly logger = createLogger(
        FindLibraryFossyRulesWithFeedbackUseCase.name,
    );
    constructor(
        @Inject(FOSSY_RULES_SERVICE_TOKEN)
        private readonly fossyRulesService: IFossyRulesService,
        @Inject(REQUEST)
        private readonly request: Request & {
            user?: { uuid: string; organization: { uuid: string } };
        },
    ) {}

    async execute(
        filters: FindLibraryFossyRulesDto,
    ): Promise<PaginatedLibraryFossyRulesResponse> {
        try {
            const { page = 1, limit = 100, skip, ...fossyRuleFilters } = filters;

            // Passa userId se o usuário estiver logado
            const userId = this.request.user?.uuid;

            const allLibraryFossyRules =
                await this.fossyRulesService.getLibraryFossyRulesWithFeedback(
                    fossyRuleFilters,
                    userId,
                );

            // Aplicar paginação
            const totalItems = allLibraryFossyRules.length;
            const totalPages = Math.ceil(totalItems / limit);
            const offset = skip || (page - 1) * limit;
            const paginatedRules = allLibraryFossyRules.slice(
                offset,
                offset + limit,
            );

            const paginationMetadata: PaginationMetadata = {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            };

            this.logger.log({
                message:
                    'Successfully retrieved library Fossy Rules with feedback',
                context: FindLibraryFossyRulesWithFeedbackUseCase.name,
                metadata: {
                    userId,
                    totalItems,
                    page,
                    limit,
                    returnedItems: paginatedRules.length,
                },
            });

            return {
                data: paginatedRules,
                pagination: paginationMetadata,
            };
        } catch (error) {
            this.logger.error({
                message: 'Error finding library Fossy Rules with feedback',
                context: FindLibraryFossyRulesWithFeedbackUseCase.name,
                error: error,
            });
            throw error;
        }
    }
}
