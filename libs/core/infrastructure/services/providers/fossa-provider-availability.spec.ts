import { GetByokProvidersUseCase } from '@libs/organization/application/use-cases/organizationParameters/get-byok-providers.use-case';
import {
    isFossaProviderAvailable,
    isProviderAvailableHere,
} from './fossa-provider-availability';
import { ProviderService } from './provider.service';

const setCloud = (on: boolean) => {
    process.env.API_CLOUD_MODE = on ? 'true' : 'false';
};

describe('fossa provider availability', () => {
    afterEach(() => setCloud(true));

    it('is available on cloud and hidden on self-hosted; other ids are never gated', () => {
        setCloud(true);
        expect(isFossaProviderAvailable()).toBe(true);
        expect(isProviderAvailableHere('fossa')).toBe(true);
        expect(isProviderAvailableHere('openai')).toBe(true);

        setCloud(false);
        expect(isFossaProviderAvailable()).toBe(false);
        expect(isProviderAvailableHere('fossa')).toBe(false);
        expect(isProviderAvailableHere('openai')).toBe(true);
    });

    it('ProviderService projects fossa as keyless + auto-listable on cloud', () => {
        setCloud(true);
        const service = new ProviderService();
        expect(service.isProviderSupported('fossa')).toBe(true);
        expect(service.getProvider('fossa')).toMatchObject({
            requiresApiKey: false,
            requiresBaseUrl: false,
            autoListModels: true,
            listsModelsLive: false,
        });
    });

    it('ProviderService drops fossa entirely on self-hosted (listing/probe/save refuse it)', () => {
        setCloud(false);
        const service = new ProviderService();
        expect(service.isProviderSupported('fossa')).toBe(false);
        expect(service.getProvider('fossa')).toBeNull();
        expect(service.getAllProviders().map((p) => p.id)).not.toContain('fossa');
        // Everyone else is untouched.
        expect(service.isProviderSupported('anthropic')).toBe(true);
    });

    it('GetByokProvidersUseCase lists fossa only on cloud (and only for an org the alpha gate allows)', async () => {
        // The alpha gate is a separate layer (fossa-provider-gate.service.spec);
        // here it says yes so the deployment rule alone is under test.
        const allow = { isEnabledFor: jest.fn(async () => true) };
        const useCase = new GetByokProvidersUseCase(allow as any);
        setCloud(true);
        expect((await useCase.execute('org-1')).providers.map((p) => p.id)).toContain('fossa');
        setCloud(false);
        expect((await useCase.execute('org-1')).providers.map((p) => p.id)).not.toContain('fossa');
        // Without a gate the descriptor stays closed even on cloud.
        setCloud(true);
        expect((await new GetByokProvidersUseCase().execute('org-1')).providers.map((p) => p.id)).not.toContain('fossa');
    });
});
