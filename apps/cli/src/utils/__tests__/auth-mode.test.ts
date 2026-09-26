import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config.js', () => ({
    loadConfig: vi.fn(),
}));

vi.mock('../credentials.js', () => ({
    loadCredentials: vi.fn(),
}));

import { loadConfig } from '../config.js';
import { loadCredentials } from '../credentials.js';
import { getAuthModeSummary } from '../auth-mode.js';

const mockLoadConfig = vi.mocked(loadConfig);
const mockLoadCredentials = vi.mocked(loadCredentials);

describe('getAuthModeSummary', () => {
    const originalFossaToken = process.env.FOSSA_TOKEN;
    const originalFossaTeamKey = process.env.FOSSA_TEAM_KEY;

    beforeEach(() => {
        vi.clearAllMocks();
        delete process.env.FOSSA_TOKEN;
        delete process.env.FOSSA_TEAM_KEY;
        mockLoadConfig.mockResolvedValue(null);
        mockLoadCredentials.mockResolvedValue(null);
    });

    afterEach(() => {
        if (originalFossaToken === undefined) {
            delete process.env.FOSSA_TOKEN;
        } else {
            process.env.FOSSA_TOKEN = originalFossaToken;
        }

        if (originalFossaTeamKey === undefined) {
            delete process.env.FOSSA_TEAM_KEY;
        } else {
            process.env.FOSSA_TEAM_KEY = originalFossaTeamKey;
        }
    });

    it('reports env token as the active auth mode', async () => {
        process.env.FOSSA_TOKEN = 'eyJ.mock.token';
        process.env.FOSSA_TEAM_KEY = 'fossa_env_key';
        mockLoadCredentials.mockResolvedValue({
            accessToken: 'stored-access',
            refreshToken: 'stored-refresh',
            expiresAt: Date.now() + 60_000,
            user: null,
        });
        mockLoadConfig.mockResolvedValue({
            teamKey: 'stored-team-key',
            teamName: 'Fossy Copilot',
            organizationName: 'Fossa',
        });

        await expect(getAuthModeSummary()).resolves.toEqual({
            mode: 'token',
            source: 'env',
            label: 'token (env)',
        });
    });

    it('reports env team key when no env token is set', async () => {
        process.env.FOSSA_TEAM_KEY = 'fossa_env_key';
        mockLoadCredentials.mockResolvedValue({
            accessToken: 'stored-access',
            refreshToken: 'stored-refresh',
            expiresAt: Date.now() + 60_000,
            user: null,
        });

        await expect(getAuthModeSummary()).resolves.toEqual({
            mode: 'team-key',
            source: 'env',
            label: 'team key (env)',
        });
    });

    it('reports logged in when stored credentials exist', async () => {
        mockLoadCredentials.mockResolvedValue({
            accessToken: 'stored-access',
            refreshToken: 'stored-refresh',
            expiresAt: Date.now() + 60_000,
            user: null,
        });

        await expect(getAuthModeSummary()).resolves.toEqual({
            mode: 'logged-in',
            source: 'stored',
            label: 'logged in',
        });
    });

    it('reports stored team key when no bearer auth exists', async () => {
        mockLoadConfig.mockResolvedValue({
            teamKey: 'stored-team-key',
            teamName: 'Fossy Copilot',
            organizationName: 'Fossa',
        });

        await expect(getAuthModeSummary()).resolves.toEqual({
            mode: 'team-key',
            source: 'stored',
            label: 'team key',
        });
    });

    it('reports trial when no auth is configured', async () => {
        await expect(getAuthModeSummary()).resolves.toEqual({
            mode: 'trial',
            source: 'none',
            label: 'trial',
        });
    });
});
