import { createLogger } from '@libs/core/log/logger';
import { Inject, Injectable } from '@nestjs/common';
import {
    FOSSY_RULES_SERVICE_TOKEN,
    IFossyRulesService,
} from '@libs/fossyRules/domain/contracts/fossyRules.service.contract';
import { FindLibraryFossyRulesDto } from '@libs/core/domain/dtos/find-library-fossy-rules.dto';
import {
    PaginatedLibraryFossyRulesResponse,
    PaginationMetadata,
} from '@libs/core/domain/dtos/paginated-library-fossy-rules.dto';

@Injectable()
export class FindLibraryFossyRulesUseCase {
    private readonly logger = createLogger(FindLibraryFossyRulesUseCase.name);
    constructor(
        @Inject(FOSSY_RULES_SERVICE_TOKEN)
        private readonly fossyRulesService: IFossyRulesService,
    ) {}

    async execute(
        filters: FindLibraryFossyRulesDto,
    ): Promise<PaginatedLibraryFossyRulesResponse> {
        try {
            const { page = 1, limit = 100, skip, ...fossyRuleFilters } = filters;

            // Para rota pública, usa getLibraryFossyRulesWithFeedback mas sem userId
            // Isso traz as contagens gerais mas não o userFeedback
            const allLibraryFossyRules =
                await this.fossyRulesService.getLibraryFossyRulesWithFeedback(
                    fossyRuleFilters,
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
                message: 'Successfully retrieved library Fossy Rules',
                context: FindLibraryFossyRulesUseCase.name,
                metadata: {
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
                message: 'Error finding library Fossy Rules',
                context: FindLibraryFossyRulesUseCase.name,
                error: error,
            });
            throw error;
        }
    }
}
