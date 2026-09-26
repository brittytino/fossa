import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { FOSSA_MARKER, generateHookScript } from '../hook/install.js';

// Mock gitService
vi.mock('../../services/git.service.js', () => ({
    gitService: {
        isGitRepository: vi.fn().mockResolvedValue(true),
        getGitRoot: vi.fn(),
        getHooksDir: vi.fn(),
    },
}));

// Mock @inquirer/prompts
vi.mock('@inquirer/prompts', () => ({
    confirm: vi.fn(),
}));

import { gitService } from '../../services/git.service.js';
import { confirm } from '@inquirer/prompts';
import { installAction } from '../hook/install.js';
import { uninstallAction } from '../hook/uninstall.js';
import { statusAction } from '../hook/status.js';

const mockConfirm = vi.mocked(confirm);

let tmpDir: string;

beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fossa-hook-test-'));
    const hooksDir = path.join(tmpDir, '.git', 'hooks');
    await fs.mkdir(hooksDir, { recursive: true });

    vi.mocked(gitService.isGitRepository).mockResolvedValue(true);
    vi.mocked(gitService.getGitRoot).mockResolvedValue(tmpDir);
    vi.mocked(gitService.getHooksDir).mockResolvedValue(hooksDir);
});

afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
});

function hookPath(): string {
    return path.join(tmpDir, '.git', 'hooks', 'pre-push');
}

describe('hook install', () => {
    it('creates hook at the correct path', async () => {
        await installAction({ failOn: 'critical', fast: true });
        const content = await fs.readFile(hookPath(), 'utf-8');
        expect(content).toBeTruthy();
    });

    it('hook contains marker and is executable', async () => {
        await installAction({ failOn: 'critical', fast: true });
        const content = await fs.readFile(hookPath(), 'utf-8');
        expect(content).toContain(FOSSA_MARKER);

        const stat = await fs.stat(hookPath());
        // Check executable bit (owner)
        expect(stat.mode & 0o100).toBeTruthy();
    });

    it('respects --fail-on severity option', async () => {
        await installAction({ failOn: 'warning', fast: true });
        const content = await fs.readFile(hookPath(), 'utf-8');
        expect(content).toContain('--fail-on warning');
    });

    it('does not overwrite existing non-fossa hook without --force', async () => {
        // Write a third-party hook
        await fs.writeFile(hookPath(), '#!/bin/sh\necho "third-party hook"\n');

        mockConfirm.mockResolvedValue(false);

        await installAction({});

        const content = await fs.readFile(hookPath(), 'utf-8');
        expect(content).toContain('third-party hook');
        expect(content).not.toContain(FOSSA_MARKER);
    });

    it('overwrites existing fossa hook without prompting', async () => {
        // Write an old fossa hook
        await fs.writeFile(
            hookPath(),
            `#!/bin/sh\n${FOSSA_MARKER}\nfossa review --fail-on error\n`,
        );

        await installAction({ failOn: 'critical', fast: true });

        const content = await fs.readFile(hookPath(), 'utf-8');
        expect(content).toContain('--fail-on critical');
    });
});

describe('hook uninstall', () => {
    it('removes hook with fossa marker', async () => {
        await fs.writeFile(
            hookPath(),
            `#!/bin/sh\n${FOSSA_MARKER}\nfossa review\n`,
        );

        await uninstallAction();

        await expect(fs.access(hookPath())).rejects.toThrow();
    });

    it('does not remove third-party hook', async () => {
        await fs.writeFile(hookPath(), '#!/bin/sh\necho "third-party"\n');

        await uninstallAction();

        const content = await fs.readFile(hookPath(), 'utf-8');
        expect(content).toContain('third-party');
    });

    it('removes only the review hook and preserves the Trace pre-push block', async () => {
        await fs.writeFile(
            hookPath(),
            [
                '#!/bin/sh',
                FOSSA_MARKER,
                'fossa review --fail-on error',
                '',
                '# fossa-trace',
                'fossa trace distill --branch feature --head abc',
                '# /fossa-trace',
                '',
            ].join('\n'),
        );

        await uninstallAction();

        const content = await fs.readFile(hookPath(), 'utf-8');
        expect(content).not.toContain(FOSSA_MARKER);
        expect(content).not.toContain('fossa review');
        expect(content).toContain('# fossa-trace');
        expect(content).toContain('fossa trace distill');
    });
});

describe('hook status', () => {
    it('detects installed fossa hook', async () => {
        const script = generateHookScript('critical', true);
        await fs.writeFile(hookPath(), script);

        const consoleSpy = vi.spyOn(console, 'log');
        await statusAction();

        const output = consoleSpy.mock.calls.map((c) => c.join(' ')).join('\n');
        expect(output).toContain('installed');
        expect(output).toContain('critical');
    });

    it('detects when no hook is installed', async () => {
        const consoleSpy = vi.spyOn(console, 'log');
        await statusAction();

        const output = consoleSpy.mock.calls.map((c) => c.join(' ')).join('\n');
        expect(output).toContain('not installed');
    });
});
