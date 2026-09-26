jest.mock('@libs/core/log/logger', () => ({
    createLogger: () => ({
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
    }),
}));

jest.mock('./utils/enrich-rules-with-context-references.util', () => ({
    enrichRulesWithContextReferences: jest.fn(async (rules) => rules),
}));

import { FindByOrganizationIdFossyRulesUseCase } from './find-by-organization-id.use-case';
import { FossyRulesStatus } from '@libs/fossyRules/domain/interfaces/fossyRules.interface';

/**
 * Regression coverage for the listing leak: the Fossy Rules screen kept
 * showing rules even after a "Reset integration and remove repositories
 * config" because this endpoint returned the raw embedded rules array,
 * including soft-deleted entries. The screen now must hide DELETED (and
 * APPLIED, to stay aligned with find-rules-in-organization-by-filter).
 */
describe('FindByOrganizationIdFossyRulesUseCase', () => {
    const ORG_ID = 'org-1';
    let useCase: FindByOrganizationIdFossyRulesUseCase;
    let fossyRulesService: { findByOrganizationId: jest.Mock };
    let contextReferenceService: any;
    let request: any;

    beforeEach(() => {
        fossyRulesService = { findByOrganizationId: jest.fn() };
        contextReferenceService = {};
        request = { user: { organization: { uuid: ORG_ID } } };

        useCase = new (FindByOrganizationIdFossyRulesUseCase as any)(
            request,
            fossyRulesService,
            contextReferenceService,
        );
    });

    it('omits DELETED rules from the response', async () => {
        fossyRulesService.findByOrganizationId.mockResolvedValueOnce({
            organizationId: ORG_ID,
            rules: [
                { uuid: 'r-active', status: FossyRulesStatus.ACTIVE },
                { uuid: 'r-deleted', status: FossyRulesStatus.DELETED },
            ],
        });

        const result = (await useCase.execute()) as { rules: any[] };

        expect(result.rules.map((r) => r.uuid)).toEqual(['r-active']);
    });

    it('omits APPLIED rules from the response', async () => {
        fossyRulesService.findByOrganizationId.mockResolvedValueOnce({
            organizationId: ORG_ID,
            rules: [
                { uuid: 'r-active', status: FossyRulesStatus.ACTIVE },
                { uuid: 'r-applied', status: FossyRulesStatus.APPLIED },
            ],
        });

        const result = (await useCase.execute()) as { rules: any[] };

        expect(result.rules.map((r) => r.uuid)).toEqual(['r-active']);
    });

    it('keeps PAUSED / PENDING / REJECTED rules visible (only DELETED+APPLIED are hidden)', async () => {
        fossyRulesService.findByOrganizationId.mockResolvedValueOnce({
            organizationId: ORG_ID,
            rules: [
                { uuid: 'r-active', status: FossyRulesStatus.ACTIVE },
                { uuid: 'r-paused', status: FossyRulesStatus.PAUSED },
                { uuid: 'r-pending', status: FossyRulesStatus.PENDING },
                { uuid: 'r-rejected', status: FossyRulesStatus.REJECTED },
                { uuid: 'r-deleted', status: FossyRulesStatus.DELETED },
            ],
        });

        const result = (await useCase.execute()) as { rules: any[] };

        expect(result.rules.map((r) => r.uuid)).toEqual([
            'r-active',
            'r-paused',
            'r-pending',
            'r-rejected',
        ]);
    });

    it('handles missing rules array gracefully', async () => {
        fossyRulesService.findByOrganizationId.mockResolvedValueOnce({
            organizationId: ORG_ID,
            rules: undefined,
        });

        const result = (await useCase.execute()) as { rules: any[] };

        expect(result.rules).toEqual([]);
    });
});
