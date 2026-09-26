import { createLogger } from '@libs/core/log/logger';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import {
    CONTEXT_REFERENCE_SERVICE_TOKEN,
    IContextReferenceService,
} from '@libs/ai-engine/domain/contextReference/contracts/context-reference.service.contract';
import {
    IFossyRulesService,
    FOSSY_RULES_SERVICE_TOKEN,
} from '@libs/fossyRules/domain/contracts/fossyRules.service.contract';
import { FossyRulesStatus } from '@libs/fossyRules/domain/interfaces/fossyRules.interface';

import { enrichRulesWithContextReferences } from './utils/enrich-rules-with-context-references.util';

@Injectable()
export class FindByOrganizationIdFossyRulesUseCase {
    private readonly logger = createLogger(
        FindByOrganizationIdFossyRulesUseCase.name,
    );
    constructor(
        @Inject(REQUEST)
        private readonly request: Request & {
            user: { organization: { uuid: string } };
        },
        @Inject(FOSSY_RULES_SERVICE_TOKEN)
        private readonly fossyRulesService: IFossyRulesService,
        @Inject(CONTEXT_REFERENCE_SERVICE_TOKEN)
        private readonly contextReferenceService: IContextReferenceService,
    ) {}

    async execute() {
        try {
            if (!this.request.user.organization.uuid) {
                throw new Error('Organization ID not found');
            }

            const existing = await this.fossyRulesService.findByOrganizationId(
                this.request.user.organization.uuid,
            );

            if (!existing) {
                throw new NotFoundException(
                    'No Fossy rules found for the given organization ID',
                );
            }

            // Soft-deleted rules stay in the document for audit/history but
            // must not surface on the Fossy Rules screen. APPLIED is also
            // hidden to match find-rules-in-organization-by-filter, which is
            // the other listing endpoint the UI uses.
            const visibleRules = (existing.rules || []).filter(
                (rule) =>
                    rule.status !== FossyRulesStatus.DELETED &&
                    rule.status !== FossyRulesStatus.APPLIED,
            );

            const enrichedRulesArray = await enrichRulesWithContextReferences(
                visibleRules,
                this.contextReferenceService,
                this.logger,
            );

            return {
                ...existing,
                rules: enrichedRulesArray,
            };
        } catch (error) {
            this.logger.error({
                message: 'Error finding Fossy Rules by organization ID',
                context: FindByOrganizationIdFossyRulesUseCase.name,
                error: error,
                metadata: {
                    organizationId: this.request.user.organization.uuid,
                },
            });
            throw error;
        }
    }
}
