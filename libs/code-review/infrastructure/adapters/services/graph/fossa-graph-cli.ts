import { createLogger } from '@libs/core/log/logger';
import { Injectable } from '@nestjs/common';
import { SandboxInstance } from '@libs/sandbox/domain/contracts/sandbox.provider';
import { shSingleQuote } from '../shell-quote';

export const FOSSA_GRAPH_VERSION = '0.3.0';

export const FOSSA_GRAPH_TIMEOUTS = {
    install: 120_000,
    parseAll: 600_000,
    parseFiles: 300_000,
    context: 60_000,
};

const BUN_PATH_PREFIX =
    'export PATH="$HOME/.bun/bin:$PATH" 2>/dev/null || true';

/**
 * Thin wrapper around the `fossa-graph` CLI. Owns install/parse/context
 * invocations so both the baseline indexer and the PR-level context service
 * share the same semantics (version, timeouts, local-vs-E2B install logic).
 */
@Injectable()
export class FossaGraphCli {
    private readonly logger = createLogger(FossaGraphCli.name);

    async install(sandbox: SandboxInstance): Promise<void> {
        const check = await sandbox.run(
            [
                BUN_PATH_PREFIX,
                'which fossa-graph 2>/dev/null && fossa-graph --version 2>/dev/null || true',
            ].join(' && '),
            { timeoutMs: 5_000 },
        );

        const output = (check.stdout || '').trim();
        const binaryFound = output.includes('/fossa-graph');
        const installedVersion = output.split('\n').pop()?.trim() || '';

        if (binaryFound && FOSSA_GRAPH_VERSION === 'latest') {
            this.logger.log({
                message: `[FOSSA-GRAPH] Found pre-installed binary (version: ${installedVersion || 'unknown'}), skipping install`,
                context: FossaGraphCli.name,
            });
            return;
        }

        if (installedVersion && installedVersion === FOSSA_GRAPH_VERSION) {
            this.logger.log({
                message: `[FOSSA-GRAPH] Version ${installedVersion} already installed, skipping`,
                context: FossaGraphCli.name,
            });
            return;
        }

        const installCmd =
            sandbox.type === 'local'
                ? `bun install -g --force @fossa/fossa-graph@${FOSSA_GRAPH_VERSION} 2>&1`
                : [
                      'which bun > /dev/null 2>&1 || (curl -fsSL https://bun.sh/install | bash > /dev/null 2>&1)',
                      'export PATH="$HOME/.bun/bin:$PATH"',
                      `bun install -g @fossa/fossa-graph@${FOSSA_GRAPH_VERSION} 2>&1`,
                  ].join(' && ');

        const result = await sandbox.run(installCmd, {
            timeoutMs: FOSSA_GRAPH_TIMEOUTS.install,
        });

        if (result.exitCode !== 0) {
            throw new Error(
                `fossa-graph install failed (exit=${result.exitCode}): ${(result.stderr || result.stdout || '').slice(0, 500)}`,
            );
        }
    }

    async parseAll(
        sandbox: SandboxInstance,
        options: {
            outPath: string;
            excludePatterns?: string[];
            timeoutMs?: number;
        },
    ): Promise<{ stderr: string }> {
        const {
            outPath,
            excludePatterns = [],
            timeoutMs = FOSSA_GRAPH_TIMEOUTS.parseAll,
        } = options;
        const outDir = dirname(outPath);
        const excludeFlags = excludePatterns
            .map((p) => `--exclude ${shSingleQuote(p)}`)
            .join(' ');

        const cmd =
            `fossa-graph parse --all --repo-dir . --out ${shSingleQuote(outPath)} ${excludeFlags}`.trim();

        const result = await sandbox.run(
            [
                BUN_PATH_PREFIX,
                `cd ${sandbox.repoDir}`,
                `mkdir -p ${shSingleQuote(outDir)}`,
                cmd,
            ].join(' && '),
            { timeoutMs },
        );

        if (result.exitCode !== 0) {
            throw new Error(
                `fossa-graph parse --all failed (exit=${result.exitCode}): ${(result.stderr || '').slice(0, 500)}`,
            );
        }

        return { stderr: result.stderr || '' };
    }

    async parseFiles(
        sandbox: SandboxInstance,
        files: string[],
        options: {
            outPath: string;
            repoDir?: string;
            timeoutMs?: number;
        },
    ): Promise<void> {
        const {
            outPath,
            repoDir = '.',
            timeoutMs = FOSSA_GRAPH_TIMEOUTS.parseFiles,
        } = options;
        const outDir = dirname(outPath);
        const filesArg = quoteFiles(files);

        const result = await sandbox.run(
            [
                BUN_PATH_PREFIX,
                `cd ${sandbox.repoDir}`,
                `mkdir -p ${shSingleQuote(outDir)}`,
                `fossa-graph parse --files ${filesArg} --repo-dir ${shSingleQuote(repoDir)} --out ${shSingleQuote(outPath)}`,
            ].join(' && '),
            { timeoutMs },
        );

        if (result.exitCode !== 0) {
            throw new Error(
                `fossa-graph parse --files failed (exit=${result.exitCode}): ${(result.stderr || '').slice(0, 500)}`,
            );
        }
    }

    async context(
        sandbox: SandboxInstance,
        files: string[],
        options: {
            outPath: string;
            graphPath?: string;
            diffPath?: string;
            timeoutMs?: number;
        },
    ): Promise<void> {
        const {
            outPath,
            graphPath,
            diffPath,
            timeoutMs = FOSSA_GRAPH_TIMEOUTS.context,
        } = options;
        const outDir = dirname(outPath);
        const filesArg = quoteFiles(files);
        const graphArg = graphPath
            ? ` --graph ${shSingleQuote(graphPath)}`
            : '';
        const diffArg = diffPath ? ` --diff ${shSingleQuote(diffPath)}` : '';
        const cmd = `fossa-graph context --files ${filesArg}${graphArg}${diffArg} --repo-dir . --format xml --out ${shSingleQuote(outPath)}`;

        const result = await sandbox.run(
            [
                BUN_PATH_PREFIX,
                `cd ${sandbox.repoDir}`,
                `mkdir -p ${shSingleQuote(outDir)}`,
                cmd,
            ].join(' && '),
            { timeoutMs },
        );

        if (result.exitCode !== 0) {
            throw new Error(
                `fossa-graph context failed (exit=${result.exitCode}): ${(result.stderr || '').slice(0, 500)}`,
            );
        }
    }
}

function quoteFiles(files: string[]): string {
    return files.map(shSingleQuote).join(' ');
}

function dirname(path: string): string {
    const idx = path.lastIndexOf('/');
    return idx === -1 ? '.' : path.slice(0, idx) || '.';
}
