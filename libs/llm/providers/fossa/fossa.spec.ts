/**
 * Fossa provider module — routing-brand behavior.
 *
 * What is pinned here and why:
 *  - the id grammar (`<upstream>/<model>`) and the CLOSED catalog: an unlisted
 *    id has no price, so it must be non-routable (capability gate) and
 *    unbuildable (build throws) — never a silent dispatch that cannot be billed;
 *  - the platform key comes from the DEDICATED env var, never the generic
 *    `API_FIREWORKS_API_KEY` & co. (a self-hosted install's keys must never be
 *    billed as Fossa credits);
 *  - Fireworks is spoken over `openai_compatible`, whose endpoint the module
 *    PINS: the org's own baseURL is dropped, never honored;
 *  - every protocol fact delegates to the upstream module under the upstream id
 *    with the bare model, so a Kimi/GLM/DeepSeek on Fossa obeys the same
 *    reasoning rules it has anywhere else.
 */
jest.mock('@libs/common/utils/crypto', () => ({
    decrypt: (v: string) => v,
    encrypt: (v: string) => v,
}));

import { REGISTRY } from '../index';
import { anthropicModule } from '../anthropic';
import { openaiModule } from '../openai';
import {
    configuredFossaUpstreams,
    fossaModule,
    fossaUpstreamBaseURL,
    FOSSA_UPSTREAM_KEY_ENV,
    splitFossaModelId,
} from './index';
import {
    isFossaCatalogModel,
    FOSSA_CATALOG,
    fossaModelPricing,
} from './catalog';
import type { ProviderBuildConfig } from '../kernel/types';

const FLASH = 'fireworks/accounts/fireworks/models/deepseek-v4-flash-0731';
const PRO = 'fireworks/accounts/fireworks/models/deepseek-v4-pro-0813';
const KIMI = 'fireworks/accounts/fireworks/models/kimi-k2p7-code';
const GLM52 = 'fireworks/accounts/fireworks/models/glm-5p2';
const GLM53F = 'fireworks/accounts/fireworks/models/glm-5p3-flash';
const bare = (id: string) => id.slice('fireworks/'.length);

const slot = (model: string): ProviderBuildConfig =>
    ({ provider: 'fossa', model, apiKey: '' }) as ProviderBuildConfig;

const ENV_KEYS = [...Object.values(FOSSA_UPSTREAM_KEY_ENV), 'API_FIREWORKS_BASE_URL'];
const GENERIC_KEYS = [
    'API_FIREWORKS_API_KEY',
    'FIREWORKS_API_KEY',
    'API_ANTHROPIC_API_KEY',
    'API_OPEN_AI_API_KEY',
];

let saved: Record<string, string | undefined>;
beforeEach(() => {
    saved = {};
    for (const k of [...ENV_KEYS, ...GENERIC_KEYS]) {
        saved[k] = process.env[k];
        delete process.env[k];
    }
});
afterEach(() => {
    for (const [k, v] of Object.entries(saved)) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
    }
});

describe('registration', () => {
    it('is registered under `fossa` with no aliases and no UI fields', () => {
        expect(REGISTRY.get('fossa')).toBe(fossaModule);
        expect(fossaModule.aliases ?? []).toEqual([]);
        expect(fossaModule.uiFields).toEqual([]);
    });
});

describe('model id grammar', () => {
    it('splits <upstream>/<model> on the FIRST slash — Fireworks ids carry more', () => {
        expect(splitFossaModelId(FLASH)).toEqual({
            upstream: 'fireworks',
            providerId: 'openai_compatible',
            model: 'accounts/fireworks/models/deepseek-v4-flash-0731',
        });
        expect(splitFossaModelId('anthropic/claude-sonnet-5')).toEqual({
            upstream: 'anthropic',
            providerId: 'anthropic',
            model: 'claude-sonnet-5',
        });
    });

    it('rejects unknown prefixes, missing slash, and empty halves', () => {
        expect(splitFossaModelId('deepseek/deepseek-v4')).toBeNull();
        expect(splitFossaModelId('accounts/fireworks/models/glm-5p2')).toBeNull();
        expect(splitFossaModelId('deepseek-v4-flash-0731')).toBeNull();
        expect(splitFossaModelId('/x')).toBeNull();
        expect(splitFossaModelId('fireworks/')).toBeNull();
        expect(splitFossaModelId(undefined)).toBeNull();
    });
});

describe('catalog = price list', () => {
    it('every entry is a Fireworks model with a routable prefix and a full price', () => {
        expect(FOSSA_CATALOG.length).toBeGreaterThan(0);
        for (const m of FOSSA_CATALOG) {
            const ref = splitFossaModelId(m.id);
            expect(ref?.upstream).toBe('fireworks');
            expect(ref?.model.startsWith('accounts/fireworks/models/')).toBe(true);
            expect(m.pricing?.inputPerMillion).toBeGreaterThan(0);
            expect(m.pricing?.outputPerMillion).toBeGreaterThan(0);
            expect(m.name).toBeTruthy();
        }
    });

    it('carries exactly the curated set (no frontier closed models)', () => {
        expect(FOSSA_CATALOG.map((m) => m.id).sort()).toEqual(
            [FLASH, PRO, KIMI, GLM52, GLM53F].sort(),
        );
    });

    it('marks at least one recommended pick', () => {
        expect(FOSSA_CATALOG.some((m) => m.recommended)).toBe(true);
    });

    it('answers pricing only for listed ids', () => {
        expect(fossaModelPricing(FLASH)).toBeDefined();
        expect(fossaModelPricing('anthropic/claude-sonnet-5')).toBeUndefined();
        expect(isFossaCatalogModel(GLM53F)).toBe(true);
        expect(isFossaCatalogModel('fireworks/accounts/fireworks/models/glm-5p3')).toBe(false);
    });

    it('lists the catalog statically under its own id only', () => {
        const listing = fossaModule.modelListing!('fossa');
        expect(listing?.kind).toBe('static');
        expect(fossaModule.modelListing!('fireworks')).toBeNull();
    });
});

describe('closed catalog: an unlisted id must not run', () => {
    it('capabilities() answers non-routable (fails every task gate)', () => {
        for (const id of [
            'anthropic/claude-sonnet-5',
            'fireworks/accounts/fireworks/models/kimi-k3',
            'deepseek-v4-flash-0731',
        ]) {
            const caps = fossaModule.capabilities(id);
            expect(caps.structuredOutput).toBe('none');
            expect(caps.toolCalling).toBe('none');
            expect(caps.supportsReasoning).toBe(false);
        }
    });

    it('build() refuses it, naming the id', () => {
        process.env.API_FOSSA_PROVIDER_FIREWORKS_API_KEY = 'k';
        process.env.API_FOSSA_PROVIDER_ANTHROPIC_API_KEY = 'k';
        expect(() =>
            fossaModule.build(slot('fireworks/accounts/fireworks/models/kimi-k3')),
        ).toThrow(/not in the Fossa catalog/);
        // A still-wired upstream with nothing in the catalog is closed too.
        expect(() => fossaModule.build(slot('anthropic/claude-sonnet-5'))).toThrow(
            /not in the Fossa catalog/,
        );
    });
});

describe('platform key + endpoint resolution', () => {
    it('build() reads the DEDICATED env var and dispatches to openai_compatible at the Fireworks endpoint', () => {
        process.env.API_FOSSA_PROVIDER_FIREWORKS_API_KEY = 'fw-fossa-platform';
        const spy = jest.spyOn(openaiModule, 'build');
        try {
            const model = fossaModule.build(slot(FLASH), { structuredOutputs: true });
            expect(model).toBeDefined();
            expect(spy).toHaveBeenCalledTimes(1);
            const [cfg, opts] = spy.mock.calls[0];
            expect(cfg.provider).toBe('openai_compatible');
            expect(cfg.model).toBe(bare(FLASH));
            expect(cfg.apiKey).toBe('fw-fossa-platform');
            expect(cfg.baseURL).toBe('https://api.fireworks.ai/inference/v1');
            expect(opts).toEqual({ structuredOutputs: true });
        } finally {
            spy.mockRestore();
        }
    });

    it('honors API_FIREWORKS_BASE_URL for the endpoint (ops knob), never the org slot', () => {
        process.env.API_FIREWORKS_BASE_URL = 'https://fireworks.internal/v1';
        expect(fossaUpstreamBaseURL('fireworks')).toBe('https://fireworks.internal/v1');
        expect(fossaUpstreamBaseURL('anthropic')).toBeUndefined();
    });

    it('build() NEVER falls back to the generic Fireworks keys', () => {
        process.env.API_FIREWORKS_API_KEY = 'fw-self-hosted-customer-key';
        process.env.FIREWORKS_API_KEY = 'fw-self-hosted-customer-key';
        expect(() => fossaModule.build(slot(FLASH))).toThrow(
            /API_FOSSA_PROVIDER_FIREWORKS_API_KEY/,
        );
    });

    it('drops org-supplied endpoint/cloud settings before delegating', () => {
        process.env.API_FOSSA_PROVIDER_FIREWORKS_API_KEY = 'fw';
        const spy = jest.spyOn(openaiModule, 'build');
        try {
            fossaModule.build({
                ...slot(PRO),
                baseURL: 'https://evil.example/v1',
                awsRegion: 'us-east-1',
            } as ProviderBuildConfig);
            const [cfg] = spy.mock.calls[0];
            expect(cfg.baseURL).toBe('https://api.fireworks.ai/inference/v1');
            expect((cfg as any).awsRegion).toBeUndefined();
            expect(cfg.provider).toBe('openai_compatible');
        } finally {
            spy.mockRestore();
        }
    });

    it('configuredFossaUpstreams() reports exactly the upstreams with a key', () => {
        expect(configuredFossaUpstreams()).toEqual([]);
        process.env.API_FOSSA_PROVIDER_FIREWORKS_API_KEY = 'f';
        process.env.API_FOSSA_PROVIDER_ANTHROPIC_API_KEY = 'a';
        expect(configuredFossaUpstreams().sort()).toEqual(['anthropic', 'fireworks']);
    });
});

describe('protocol facts delegate to the upstream under the upstream id', () => {
    const upCfg = (id: string): ProviderBuildConfig =>
        ({
            provider: 'openai_compatible',
            model: bare(id),
            apiKey: '',
            baseURL: 'https://api.fireworks.ai/inference/v1',
        }) as ProviderBuildConfig;

    it.each([FLASH, PRO, KIMI, GLM52, GLM53F])('%s: capabilities == upstream(bare)', (id) => {
        expect(fossaModule.capabilities(id)).toEqual(openaiModule.capabilities(bare(id)));
    });

    it.each([FLASH, KIMI, GLM52, GLM53F])('%s: reasoningTraits + temperaturePolicy', (id) => {
        expect(fossaModule.reasoningTraits(slot(id))).toEqual(
            openaiModule.reasoningTraits(upCfg(id)),
        );
        expect(fossaModule.temperaturePolicy(slot(id))).toEqual(
            openaiModule.temperaturePolicy(upCfg(id)),
        );
    });

    it.each([FLASH, KIMI, GLM53F])('%s: reasoning() for every effort', (id) => {
        for (const effort of ['none', 'low', 'medium', 'high'] as const) {
            expect(fossaModule.reasoning!(slot(id), effort)).toEqual(
                openaiModule.reasoning!(upCfg(id), effort),
            );
        }
    });

    it("Fireworks' version separator is understood: GLM 5.3 and Kimi K2.7 Code always think", () => {
        expect(fossaModule.reasoningTraits(slot(GLM53F)).canDisableThinking).toBe(false);
        expect(fossaModule.reasoningTraits(slot(KIMI)).canDisableThinking).toBe(false);
        expect(fossaModule.reasoningTraits(slot(GLM52)).canDisableThinking).toBe(true);
        expect(fossaModule.reasoningTraits(slot(FLASH)).thinksByDefault).toBe(true);
    });

    it('providerOptionsNamespace is the UPSTREAM namespace (override wrapping)', () => {
        expect(fossaModule.providerOptionsNamespace!('fossa', FLASH)).toBe(
            openaiModule.providerOptionsNamespace!('openai_compatible', bare(FLASH)),
        );
        expect(fossaModule.providerOptionsNamespace!('fossa', 'nope/x')).toBeUndefined();
    });

    it('no explicit cache breakpoint over the OpenAI protocol; promptCaching stays declared', () => {
        expect(fossaModule.systemCacheControl!(slot(FLASH))).toBeUndefined();
        for (const m of FOSSA_CATALOG) {
            expect(fossaModule.capabilities(m.id).promptCaching).toBe(true);
        }
    });

    it('a code-review-capable catalog: every listed model passes the review task gate', () => {
        for (const m of FOSSA_CATALOG) {
            const caps = fossaModule.capabilities(m.id);
            expect(caps.structuredOutput !== 'none' || caps.toolCalling === 'native').toBe(
                true,
            );
            expect(caps.supportsReasoning).toBe(true);
        }
    });

    it('the anthropic upstream stays wired but closed: it parses, yet routes nothing', () => {
        expect(splitFossaModelId('anthropic/claude-opus-5')?.providerId).toBe(anthropicModule.id);
        // Not in the catalog → no namespace, no capabilities, no build.
        expect(fossaModule.providerOptionsNamespace!('fossa', 'anthropic/claude-opus-5')).toBeUndefined();
    });
});
