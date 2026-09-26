import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import { Client as PgClient } from 'pg';
import { randomUUID } from 'crypto';
import { DeliveryStatus } from '@libs/platformData/domain/pullRequests/enums/deliveryStatus.enum';
import { PriorityStatus } from '@libs/platformData/domain/pullRequests/enums/priorityStatus.enum';
import { AutomationStatus } from '@libs/automation/domain/automation/enum/automation-status';

interface SeedConfig {
    teamAutomationId: string;
    repositoryId?: string;
    repositoryName?: string;
    repositoryFullName?: string;
    organizationId?: string;
    teamId?: string;
    count: number;
    startNumber?: number;
    suggestionsPerFile: number;
    minFiles?: number;
    maxFiles?: number;
    minSuggestionsPerFile?: number;
    maxSuggestionsPerFile?: number;
    origin: string;
    dryRun: boolean;
}

interface TeamAutomationInfo {
    teamAutomationUuid: string;
    teamUuid: string | null;
    teamName: string | null;
    organizationUuid: string | null;
    organizationName: string | null;
    automationUuid: string | null;
    automationName: string | null;
    automationType: string | null;
}

interface TemplateData {
    title: string;
    status: string;
    merged: boolean;
    baseBranchRef: string;
    headBranchRef: string;
    provider: string;
    files: Array<any>;
    totalAdded: number;
    totalDeleted: number;
    totalChanges: number;
    commits: Array<any>;
    reviewers: Array<any>;
    assignees: Array<any>;
    prLevelSuggestions: Array<any>;
    syncedEmbeddedSuggestions: boolean;
    syncedWithIssues: boolean;
    isDraft: boolean;
    user: {
        id: string;
        username: string;
        name?: string;
        email?: string | null;
    };
}

const DEFAULT_TEMPLATE: TemplateData = {
    title: 'Seeded PR #',
    status: 'open',
    merged: false,
    baseBranchRef: 'main',
    headBranchRef: 'feature/seed',
    provider: 'GITHUB',
    files: [
        {
            filename: 'chaos_master.js',
            path: 'chaos_master.js',
            previousName: '',
            status: 'modified',
            added: 228,
            deleted: 12,
            changes: 240,
            reviewMode: 'light_mode',
            codeReviewModelUsed: {
                generateSuggestions: 'seed:model',
                safeguard: 'seed:model',
            },
        },
        {
            filename: 'mega_chaos.js',
            path: 'mega_chaos.js',
            previousName: '',
            status: 'modified',
            added: 253,
            deleted: 5,
            changes: 258,
            reviewMode: 'light_mode',
            codeReviewModelUsed: {
                generateSuggestions: 'seed:model',
                safeguard: 'seed:model',
            },
        },
        {
            filename: 'rule_destroyer.js',
            path: 'rule_destroyer.js',
            previousName: '',
            status: 'modified',
            added: 187,
            deleted: 20,
            changes: 207,
            reviewMode: 'light_mode',
            codeReviewModelUsed: {
                generateSuggestions: 'seed:model',
                safeguard: 'seed:model',
            },
        },
        {
            filename: 'simple_violations.js',
            path: 'simple_violations.js',
            previousName: '',
            status: 'modified',
            added: 37,
            deleted: 3,
            changes: 40,
            reviewMode: 'light_mode',
            codeReviewModelUsed: {
                generateSuggestions: 'seed:model',
                safeguard: 'seed:model',
            },
        },
    ],
    totalAdded: 120,
    totalDeleted: 10,
    totalChanges: 130,
    commits: [
        {
            sha: 'seedcommit',
            created_at: new Date().toISOString(),
            message: 'Seed commit message',
            author: {
                id: 0,
                name: 'seed-bot',
                email: 'seed@example.com',
                date: new Date().toISOString(),
                username: 'seed-bot',
            },
            parents: [{ sha: 'seedparent' }],
        },
    ],
    reviewers: [],
    assignees: [],
    prLevelSuggestions: [],
    syncedEmbeddedSuggestions: false,
    syncedWithIssues: false,
    isDraft: false,
    user: {
        id: '0',
        username: 'seed-bot',
        name: 'Seed Bot',
        email: 'seed@example.com',
    },
};

const randomInt = (min: number, max: number): number => {
    const lower = Math.ceil(min);
    const upper = Math.floor(max);
    return Math.floor(Math.random() * (upper - lower + 1)) + lower;
};

const randomChoice = <T>(values: readonly T[]): T => {
    return values[randomInt(0, values.length - 1)];
};

function parseArgs(): SeedConfig {
    const args = process.argv.slice(2);

    const getFlagValue = (flag: string): string | undefined => {
        const flagIndex = args.indexOf(flag);
        if (flagIndex >= 0 && flagIndex + 1 < args.length) {
            return args[flagIndex + 1];
        }
        return undefined;
    };

    const booleanFlags = new Set([
        '--dry-run',
    ]);

    const hasFlag = (flag: string): boolean => {
        if (booleanFlags.has(flag)) {
            return args.includes(flag);
        }
        return false;
    };

    const teamAutomationId =
        getFlagValue('--team-automation-id') ??
        process.env.SEED_TEAM_AUTOMATION_ID;
    const repositoryId =
        getFlagValue('--repository-id') ?? process.env.SEED_REPOSITORY_ID;
    const repositoryName =
        getFlagValue('--repository-name') ?? process.env.SEED_REPOSITORY_NAME;
    const repositoryFullName =
        getFlagValue('--repository-full-name') ??
        process.env.SEED_REPOSITORY_FULL_NAME;
    const organizationId =
        getFlagValue('--organization-id') ?? process.env.SEED_ORGANIZATION_ID;
    const teamId = getFlagValue('--team-id') ?? process.env.SEED_TEAM_ID;

    if (!teamAutomationId) {
        throw new Error(
            'Missing team automation id. Provide --team-automation-id or set SEED_TEAM_AUTOMATION_ID.',
        );
    }

    const countRaw =
        getFlagValue('--count') ?? process.env.SEED_COUNT ?? '50';
    const count = parseInt(countRaw, 10);

    if (Number.isNaN(count) || count <= 0) {
        throw new Error('Count must be a positive integer.');
    }

    const startNumberRaw =
        getFlagValue('--start-number') ?? process.env.SEED_START_NUMBER;
    const startNumber = startNumberRaw ? parseInt(startNumberRaw, 10) : undefined;

    if (startNumberRaw && (Number.isNaN(startNumber) || startNumber < 0)) {
        throw new Error('start-number must be a positive integer when provided.');
    }

    const suggestionsPerFileRaw =
        getFlagValue('--suggestions-per-file') ??
        process.env.SEED_SUGGESTIONS_PER_FILE ??
        '4';
    const suggestionsPerFile = parseInt(suggestionsPerFileRaw, 10);

    if (Number.isNaN(suggestionsPerFile) || suggestionsPerFile < 1) {
        throw new Error('suggestions-per-file must be an integer greater than zero.');
    }

    const minFilesRaw =
        getFlagValue('--min-files') ?? process.env.SEED_MIN_FILES;
    const minFiles = minFilesRaw ? parseInt(minFilesRaw, 10) : undefined;

    const maxFilesRaw =
        getFlagValue('--max-files') ?? process.env.SEED_MAX_FILES;
    const maxFiles = maxFilesRaw ? parseInt(maxFilesRaw, 10) : undefined;

    const minSuggestionsPerFileRaw =
        getFlagValue('--min-suggestions-per-file') ??
        process.env.SEED_MIN_SUGGESTIONS_PER_FILE;
    const minSuggestionsPerFile = minSuggestionsPerFileRaw
        ? parseInt(minSuggestionsPerFileRaw, 10)
        : undefined;

    const maxSuggestionsPerFileRaw =
        getFlagValue('--max-suggestions-per-file') ??
        process.env.SEED_MAX_SUGGESTIONS_PER_FILE;
    const maxSuggestionsPerFile = maxSuggestionsPerFileRaw
        ? parseInt(maxSuggestionsPerFileRaw, 10)
        : undefined;

    const origin =
        getFlagValue('--origin') ?? process.env.SEED_ORIGIN ?? 'seed-script';

    const dryRun = hasFlag('--dry-run') || process.env.SEED_DRY_RUN === 'true';

    return {
        teamAutomationId,
        repositoryId,
        repositoryName,
        repositoryFullName,
        organizationId,
        teamId,
        count,
        startNumber,
        suggestionsPerFile,
        minFiles,
        maxFiles,
        minSuggestionsPerFile,
        maxSuggestionsPerFile,
        origin,
        dryRun,
    };
}

function slugify(value?: string | null, fallback = 'seed-org'): string {
    if (!value) {
        return fallback;
    }

    const cleaned = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return cleaned || fallback;
}

function deriveRepositoryId(info: TeamAutomationInfo): string {
    const source = info.teamUuid ?? info.teamAutomationUuid ?? randomUUID();
    const trimmed = source.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
    return trimmed || `seed${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

function deriveRepositoryName(
    info: TeamAutomationInfo,
    repositoryId: string,
): string {
    const fallback = `seed-repo-${repositoryId.slice(0, 6) || 'default'}`;
    const base = info.teamName ?? fallback;
    return slugify(base, fallback);
}

function deriveRepositoryFullName(
    info: TeamAutomationInfo,
    repositoryName: string,
): string {
    const orgSlug = slugify(info.organizationName, 'seed-org');
    return `${orgSlug}/${repositoryName}`;
}

async function fetchTeamAutomationInfo(
    pgClient: PgClient,
    teamAutomationId: string,
): Promise<TeamAutomationInfo> {
    const query = `
        SELECT
            ta."uuid"                      AS "teamAutomationUuid",
            ta."teamUuid"                  AS "teamUuid",
            t."name"                       AS "teamName",
            o."uuid"                       AS "organizationUuid",
            o."name"                       AS "organizationName",
            ta."automationUuid"            AS "automationUuid",
            a."name"                       AS "automationName",
            a."automationType"             AS "automationType"
        FROM "team_automations" ta
        LEFT JOIN "teams" t ON t."uuid" = ta."teamUuid"
        LEFT JOIN "organizations" o ON o."uuid" = t."organization_id"
        LEFT JOIN "automation" a ON a."uuid" = ta."automationUuid"
        WHERE ta."uuid" = $1
    `;

    const result = await pgClient.query(query, [teamAutomationId]);

    if (!result.rowCount) {
        throw new Error(
            `team_automations row not found for uuid ${teamAutomationId}. Check the value and try again.`,
        );
    }

    const row = result.rows[0];

    return {
        teamAutomationUuid: row.teamautomationuuid,
        teamUuid: row.teamuuid,
        teamName: row.teamname ?? null,
        organizationUuid: row.organizationuuid,
        organizationName: row.organizationname ?? null,
        automationUuid: row.automationuuid ?? null,
        automationName: row.automationname ?? null,
        automationType: row.automationtype ?? null,
    };
}

async function buildTemplate(
    collection,
    repositoryId: string,
): Promise<TemplateData> {
    const existingTemplate = await collection
        .find({ 'repository.id': repositoryId })
        .sort({ number: -1 })
        .limit(1)
        .toArray();

    if (existingTemplate.length === 0) {
        return JSON.parse(JSON.stringify(DEFAULT_TEMPLATE));
    }

    const {
        title,
        status,
        merged,
        baseBranchRef,
        headBranchRef,
        provider,
        files,
        totalAdded,
        totalDeleted,
        totalChanges,
        commits,
        reviewers,
        assignees,
        prLevelSuggestions,
        syncedEmbeddedSuggestions,
        syncedWithIssues,
        isDraft,
        user,
    } = existingTemplate[0];

    return {
        title,
        status,
        merged,
        baseBranchRef,
        headBranchRef,
        provider,
        files,
        totalAdded,
        totalDeleted,
        totalChanges,
        commits,
        reviewers,
        assignees,
        prLevelSuggestions,
        syncedEmbeddedSuggestions,
        syncedWithIssues,
        isDraft,
        user,
    };
}

async function computeStartNumber(
    collection,
    repositoryId: string,
    providedStartNumber?: number,
): Promise<number> {
    if (providedStartNumber) {
        return providedStartNumber;
    }

    const latestPr = await collection
        .find({ 'repository.id': repositoryId })
        .sort({ number: -1 })
        .limit(1)
        .toArray();

    if (!latestPr.length) {
        return 1;
    }

    const currentNumber = latestPr[0].number ?? 0;
    return currentNumber + 1;
}

function clone<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
}

function inferLanguageFromPath(path: string): string {
    if (path.endsWith('.ts')) return 'typescript';
    if (path.endsWith('.js')) return 'javascript';
    if (path.endsWith('.md') || path.endsWith('.mdc')) return 'markdown';
    if (path.endsWith('.rs')) return 'rust';
    if (path.endsWith('.py')) return 'python';
    return 'plaintext';
}

function buildSuggestions(
    filePath: string,
    createdAt: string,
    suggestionsPerFile: number,
) {
    const maxPerStatus = Math.max(1, suggestionsPerFile);
    const statuses: DeliveryStatus[] = [
        DeliveryStatus.SENT,
        DeliveryStatus.NOT_SENT,
        DeliveryStatus.FAILED,
        DeliveryStatus.FAILED_LINES_MISMATCH,
    ];

    const priorityPool: PriorityStatus[] = [
        PriorityStatus.PRIORITIZED,
        PriorityStatus.PRIORITIZED_BY_CLUSTERING,
        PriorityStatus.DISCARDED_BY_SEVERITY,
        PriorityStatus.DISCARDED_BY_QUANTITY,
        PriorityStatus.DISCARDED_BY_SAFEGUARD,
    ];

    const severityPool = ['low', 'medium', 'high'] as const;

    const suggestions = [];
    let lineCursor = 1;

    statuses.forEach((status) => {
        const countForStatus = randomInt(1, maxPerStatus);

        for (let index = 0; index < countForStatus; index++) {
            const summaryIndex = suggestions.length + 1;

            suggestions.push({
                id: randomUUID(),
                relevantFile: filePath,
                language: inferLanguageFromPath(filePath),
                suggestionContent: `Improve ${filePath}: snippet ${summaryIndex}.`,
                existingCode: '// existing code snippet',
                improvedCode: '// improved code snippet',
                oneSentenceSummary: `Auto-generated suggestion ${summaryIndex} for ${filePath}.`,
                relevantLinesStart: lineCursor,
                relevantLinesEnd: lineCursor + 3,
                label: 'seed',
                severity: randomChoice(severityPool),
                rankScore: randomInt(1, 100),
                priorityStatus: randomChoice(priorityPool),
                deliveryStatus: status,
                type: 'seed',
                createdAt,
                updatedAt: createdAt,
            });

            lineCursor += 5;
        }
    });

    return suggestions;
}

function generateRandomFiles(
    numFiles: number,
    createdAt: string,
    minSuggestions: number,
    maxSuggestions: number,
): Array<any> {
    const extensions = ['.ts', '.js', '.tsx', '.jsx', '.py', '.rs', '.go', '.java', '.md'];
    const directories = [
        'src/components/',
        'src/services/',
        'src/utils/',
        'src/api/',
        'libs/core/',
        'libs/domain/',
        'tests/',
        'scripts/',
    ];

    const files = [];

    for (let i = 0; i < numFiles; i++) {
        const ext = randomChoice(extensions);
        const dir = randomChoice(directories);
        const filename = `file_${i}_${randomInt(100, 999)}${ext}`;
        const path = `${dir}${filename}`;
        const suggestionsCount = randomInt(minSuggestions, maxSuggestions);

        files.push({
            id: randomUUID(),
            filename,
            path,
            previousName: '',
            status: randomChoice(['modified', 'added', 'removed'] as const),
            added: randomInt(10, 500),
            deleted: randomInt(0, 100),
            changes: randomInt(10, 600),
            reviewMode: 'light_mode',
            codeReviewModelUsed: {
                generateSuggestions: 'seed:model',
                safeguard: 'seed:model',
            },
            createdAt,
            updatedAt: createdAt,
            suggestions: buildSuggestions(path, createdAt, suggestionsCount),
        });
    }

    return files;
}

function buildFiles(
    filesTemplate: Array<any>,
    createdAt: string,
    suggestionsPerFile: number,
    minFiles?: number,
    maxFiles?: number,
    minSuggestionsPerFile?: number,
    maxSuggestionsPerFile?: number,
) {
    // If min/max files specified, generate random number of files
    if (minFiles !== undefined && maxFiles !== undefined) {
        const numFiles = randomInt(minFiles, maxFiles);
        const minSugg = minSuggestionsPerFile ?? suggestionsPerFile;
        const maxSugg = maxSuggestionsPerFile ?? suggestionsPerFile;
        return generateRandomFiles(numFiles, createdAt, minSugg, maxSugg);
    }

    // Original logic - use template
    if (!Array.isArray(filesTemplate) || filesTemplate.length === 0) {
        return clone(DEFAULT_TEMPLATE.files).map((file) => ({
            ...file,
            id: randomUUID(),
            createdAt,
            updatedAt: createdAt,
            suggestions: buildSuggestions(file.path, createdAt, suggestionsPerFile),
        }));
    }

    return filesTemplate.map((rawFile) => {
        const file = clone(rawFile);
        const effectiveSuggestionsPerFile = minSuggestionsPerFile !== undefined && maxSuggestionsPerFile !== undefined
            ? randomInt(minSuggestionsPerFile, maxSuggestionsPerFile)
            : suggestionsPerFile;

        const suggestions = buildSuggestions(
            file.path ?? file.filename,
            createdAt,
            effectiveSuggestionsPerFile,
        );

        return {
            ...file,
            id: randomUUID(),
            createdAt,
            updatedAt: createdAt,
            suggestions,
            added: file.added ?? 0,
            deleted: file.deleted ?? 0,
            changes: file.changes ?? file.added ?? 0,
            reviewMode: file.reviewMode ?? 'light_mode',
            codeReviewModelUsed:
                file.codeReviewModelUsed ??
                clone(DEFAULT_TEMPLATE.files[0].codeReviewModelUsed),
        };
    });
}

function buildPullRequestDocument(options: {
    template: TemplateData;
    prNumber: number;
    repositoryId: string;
    repositoryName: string;
    repositoryFullName: string;
    organizationId: string;
    createdAt: Date;
    suggestionsPerFile: number;
    minFiles?: number;
    maxFiles?: number;
    minSuggestionsPerFile?: number;
    maxSuggestionsPerFile?: number;
}) {
    const {
        template,
        prNumber,
        repositoryId,
        repositoryName,
        repositoryFullName,
        organizationId,
        createdAt,
        suggestionsPerFile,
        minFiles,
        maxFiles,
        minSuggestionsPerFile,
        maxSuggestionsPerFile,
    } = options;

    const isoDate = createdAt.toISOString();
    const files = buildFiles(
        template.files,
        isoDate,
        suggestionsPerFile,
        minFiles,
        maxFiles,
        minSuggestionsPerFile,
        maxSuggestionsPerFile,
    );

    const totalAdded = files.reduce((sum, file) => sum + (file.added ?? 0), 0);
    const totalDeleted = files.reduce((sum, file) => sum + (file.deleted ?? 0), 0);
    const totalChanges = files.reduce(
        (sum, file) => sum + (file.changes ?? file.added ?? 0),
        0,
    );

    // Pre-compute suggestionsCount for performance optimization
    const suggestionsCount = files.reduce(
        (acc, file) => {
            for (const suggestion of file.suggestions ?? []) {
                if (suggestion.deliveryStatus === DeliveryStatus.SENT) {
                    acc.sent++;
                } else if (suggestion.deliveryStatus === DeliveryStatus.NOT_SENT) {
                    acc.filtered++;
                }
            }
            return acc;
        },
        { sent: 0, filtered: 0 },
    );

    return {
        _id: new ObjectId(),
        title: `${template.title} ${prNumber}`,
        status: template.status,
        number: prNumber,
        merged: template.merged,
        url: `https://github.com/${repositoryFullName}/pull/${prNumber}`,
        baseBranchRef: template.baseBranchRef,
        headBranchRef: `${template.headBranchRef}-${prNumber}`,
        openedAt: isoDate,
        closedAt: template.merged ? isoDate : null,
        repository: {
            id: repositoryId,
            name: repositoryName,
            fullName: repositoryFullName,
            language: files.some((file) => file.path?.endsWith('.rs'))
                ? 'Rust'
                : files.some((file) => file.path?.endsWith('.ts'))
                  ? 'TypeScript'
                  : 'JavaScript',
            url: `https://api.github.com/repos/${repositoryFullName}`,
            createdAt: isoDate,
            updatedAt: isoDate,
        },
        files,
        totalAdded,
        totalDeleted,
        totalChanges,
        provider: template.provider,
        user: clone(template.user),
        reviewers: clone(template.reviewers),
        assignees: clone(template.assignees),
        organizationId,
        commits: clone(template.commits),
        syncedEmbeddedSuggestions: template.syncedEmbeddedSuggestions,
        syncedWithIssues: template.syncedWithIssues,
        prLevelSuggestions: clone(template.prLevelSuggestions),
        isDraft: template.isDraft,
        suggestionsCount, // Add pre-computed count
        createdAt: isoDate,
        updatedAt: isoDate,
    };
}

function buildAutomationExecutionRow(options: {
    uuid: string;
    createdAt: Date;
    status: AutomationStatus;
    origin: string;
    teamAutomationInfo: TeamAutomationInfo;
    repositoryId: string;
    repositoryName: string;
    repositoryFullName: string;
    prNumber: number;
    prTitle: string;
}) {
    const {
        uuid,
        createdAt,
        status,
        origin,
        teamAutomationInfo,
        repositoryId,
        repositoryName,
        repositoryFullName,
        prNumber,
        prTitle,
    } = options;

    const dataExecution = {
        platformType: 'GITHUB',
        repositoryId,
        pullRequestNumber: prNumber,
        lastAnalyzedCommit: {
            sha: randomUUID().replace(/-/g, '').slice(0, 40),
            author: {
                id: teamAutomationInfo.teamUuid,
                date: createdAt.toISOString(),
                username: teamAutomationInfo.teamName ?? 'seed-team',
            },
        },
        repository: {
            id: repositoryId,
            name: repositoryName,
            fullName: repositoryFullName,
            url: `https://api.github.com/repos/${repositoryFullName}`,
        },
        pullRequest: {
            number: prNumber,
            title: prTitle,
            url: `https://github.com/${repositoryFullName}/pull/${prNumber}`,
        },
        team: {
            uuid: teamAutomationInfo.teamUuid,
            name: teamAutomationInfo.teamName ?? 'Seed Team',
        },
        automation: teamAutomationInfo.automationUuid
            ? {
                  uuid: teamAutomationInfo.automationUuid,
                  name: teamAutomationInfo.automationName ?? 'Seed Automation',
                  type: teamAutomationInfo.automationType ?? 'Seed',
              }
            : undefined,
    };

    return {
        uuid,
        createdAt,
        updatedAt: createdAt,
        status,
        errorMessage: null,
        dataExecution,
        pullRequestNumber: prNumber,
        repositoryId,
        teamAutomationId: teamAutomationInfo.teamAutomationUuid,
        origin,
    };
}

function buildCodeReviewExecutionRows(options: {
    automationExecutionUuid: string;
    createdAt: Date;
    finalStatus: AutomationStatus.SUCCESS | AutomationStatus.ERROR;
}) {
    const { automationExecutionUuid, createdAt, finalStatus } = options;

    const startedAt = createdAt;
    const finishedAt = new Date(createdAt.getTime() + 60_000);

    const completionMessage =
        finalStatus === AutomationStatus.SUCCESS
            ? 'Code review completed successfully'
            : 'Automation failed during execution';

    return [
        {
            uuid: randomUUID(),
            automationExecutionUuid,
            createdAt: startedAt,
            updatedAt: startedAt,
            status: AutomationStatus.IN_PROGRESS,
            message: 'Automation started',
        },
        {
            uuid: randomUUID(),
            automationExecutionUuid,
            createdAt: finishedAt,
            updatedAt: finishedAt,
            status: finalStatus,
            message: completionMessage,
        },
    ];
}

async function connectToPostgres(): Promise<PgClient> {
    const client = new PgClient({
        host: process.env.SEED_PG_HOST ?? process.env.API_PG_DB_HOST ?? 'localhost',
        port: Number(process.env.SEED_PG_PORT ?? process.env.API_PG_DB_PORT ?? 5432),
        user: process.env.SEED_PG_USER ?? process.env.API_PG_DB_USERNAME,
        password:
            process.env.SEED_PG_PASSWORD ?? process.env.API_PG_DB_PASSWORD ?? '',
        database:
            process.env.SEED_PG_DATABASE ?? process.env.API_PG_DB_DATABASE,
    });

    await client.connect();
    return client;
}

async function connectToMongo(): Promise<MongoClient> {
    const username =
        encodeURIComponent(
            process.env.SEED_MONGO_USER ?? process.env.API_MG_DB_USERNAME ?? '',
        );
    const password =
        encodeURIComponent(
            process.env.SEED_MONGO_PASSWORD ?? process.env.API_MG_DB_PASSWORD ?? '',
        );
    const host = process.env.SEED_MONGO_HOST ?? process.env.API_MG_DB_HOST ?? 'localhost';
    const port = Number(
        process.env.SEED_MONGO_PORT ?? process.env.API_MG_DB_PORT ?? 27017,
    );
    const database =
        process.env.SEED_MONGO_DATABASE ?? process.env.API_MG_DB_DATABASE ?? 'fossa_db';

    const credentials = username ? `${username}:${password}@` : '';
    const uri = `mongodb://${credentials}${host}:${port}/${database}?authSource=${username ? 'admin' : database}`;

    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5_000,
    });

    await client.connect();
    return client;
}

async function insertAutomationExecutions(
    pgClient: PgClient,
    automationRows: Array<any>,
    codeReviewRows: Array<any>,
) {
    await pgClient.query('BEGIN');

    try {
        for (const row of automationRows) {
            await pgClient.query(
                `
                    INSERT INTO "automation_execution"
                        ("uuid", "createdAt", "updatedAt", "status", "errorMessage", "dataExecution", "pullRequestNumber", "repositoryId", "team_automation_id", "origin")
                    VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10)
                `,
                [
                    row.uuid,
                    row.createdAt,
                    row.updatedAt,
                    row.status,
                    row.errorMessage,
                    JSON.stringify(row.dataExecution ?? {}),
                    row.pullRequestNumber,
                    row.repositoryId,
                    row.teamAutomationId,
                    row.origin,
                ],
            );
        }

        for (const row of codeReviewRows) {
            await pgClient.query(
                `
                    INSERT INTO "code_review_execution"
                        ("uuid", "createdAt", "updatedAt", "status", "message", "automation_execution_id")
                    VALUES ($1, $2, $3, $4, $5, $6)
                `,
                [
                    row.uuid,
                    row.createdAt,
                    row.updatedAt,
                    row.status,
                    row.message,
                    row.automationExecutionUuid,
                ],
            );
        }

        await pgClient.query('COMMIT');
    } catch (error) {
        await pgClient.query('ROLLBACK');
        throw error;
    }
}

async function cleanupPostgres(
    pgClient: PgClient,
    automationUuids: string[],
) {
    if (!automationUuids.length) {
        return;
    }

    await pgClient.query('BEGIN');
    try {
        await pgClient.query(
            'DELETE FROM "code_review_execution" WHERE "automation_execution_id" = ANY($1::uuid[])',
            [automationUuids],
        );

        await pgClient.query(
            'DELETE FROM "automation_execution" WHERE "uuid" = ANY($1::uuid[])',
            [automationUuids],
        );

        await pgClient.query('COMMIT');
    } catch (error) {
        await pgClient.query('ROLLBACK');
        throw error;
    }
}

async function main() {
    const initialConfig = parseArgs();

    const pgClient = await connectToPostgres();
    const mongoClient = await connectToMongo();

    try {
        const teamAutomationInfo = await fetchTeamAutomationInfo(
            pgClient,
            initialConfig.teamAutomationId,
        );

        const organizationId =
            initialConfig.organizationId ??
            teamAutomationInfo.organizationUuid ??
            null;

        if (!organizationId) {
            throw new Error(
                `Unable to determine organization for team automation ${initialConfig.teamAutomationId}. ` +
                    'Pass --organization-id <uuid> or set SEED_ORGANIZATION_ID.',
            );
        }

        const effectiveTeamUuid =
            teamAutomationInfo.teamUuid ??
            initialConfig.teamId ??
            teamAutomationInfo.teamAutomationUuid;

        const effectiveTeamName =
            teamAutomationInfo.teamName ?? 'Seed Team';

        const hydratedTeamAutomationInfo: TeamAutomationInfo = {
            ...teamAutomationInfo,
            teamAutomationUuid:
                teamAutomationInfo.teamAutomationUuid ??
                initialConfig.teamAutomationId,
            teamUuid: effectiveTeamUuid,
            teamName: effectiveTeamName,
            organizationUuid: organizationId,
        };

        const repositoryId =
            initialConfig.repositoryId ??
            deriveRepositoryId(hydratedTeamAutomationInfo);
        const repositoryName =
            initialConfig.repositoryName ??
            deriveRepositoryName(hydratedTeamAutomationInfo, repositoryId);
        const repositoryFullName =
            initialConfig.repositoryFullName ??
            deriveRepositoryFullName(hydratedTeamAutomationInfo, repositoryName);

        const config = {
            ...initialConfig,
            repositoryId,
            repositoryName,
            repositoryFullName,
            organizationId,
            teamId: initialConfig.teamId ?? hydratedTeamAutomationInfo.teamUuid,
        };

        console.log('Seed configuration:', {
            teamAutomationId: config.teamAutomationId,
            repositoryId: config.repositoryId,
            repositoryName: config.repositoryName,
            repositoryFullName: config.repositoryFullName,
            organizationId: config.organizationId,
            teamId: config.teamId ?? hydratedTeamAutomationInfo.teamUuid,
            count: config.count,
            startNumber: config.startNumber,
            suggestionsPerFile: config.suggestionsPerFile,
            minFiles: config.minFiles,
            maxFiles: config.maxFiles,
            minSuggestionsPerFile: config.minSuggestionsPerFile,
            maxSuggestionsPerFile: config.maxSuggestionsPerFile,
            origin: config.origin,
            dryRun: config.dryRun,
            defaultsApplied: {
                repositoryId: !initialConfig.repositoryId,
                repositoryName: !initialConfig.repositoryName,
                repositoryFullName: !initialConfig.repositoryFullName,
                organizationId: !initialConfig.organizationId,
                teamId: !initialConfig.teamId,
            },
        });

        console.log('Team automation context:', {
            teamUuid: hydratedTeamAutomationInfo.teamUuid,
            teamName: hydratedTeamAutomationInfo.teamName,
            organizationUuid: hydratedTeamAutomationInfo.organizationUuid,
            organizationName: teamAutomationInfo.organizationName,
            automationUuid: teamAutomationInfo.automationUuid,
            automationName: teamAutomationInfo.automationName,
        });

        const collection = mongoClient
            .db(
                process.env.SEED_MONGO_DATABASE ??
                    process.env.API_MG_DB_DATABASE ??
                    'fossa_db',
            )
            .collection('pullRequests');

        const template = await buildTemplate(
            collection,
            config.repositoryId,
        );

        const startNumber = await computeStartNumber(
            collection,
            config.repositoryId,
            config.startNumber,
        );

        const documents = [];
        const automationRows = [];
        const codeReviewRows = [];
        const automationUuids = [];

        for (let index = 0; index < config.count; index++) {
            const prNumber = startNumber + index;
            const createdAt = new Date(Date.now() - index * 3_600_000);
            const isError = (index + 1) % 12 === 0;
            const automationFinalStatus = isError
                ? AutomationStatus.ERROR
                : AutomationStatus.SUCCESS;
            const prDocument = buildPullRequestDocument({
                template,
                prNumber,
                repositoryId: config.repositoryId,
                repositoryName: config.repositoryName,
                repositoryFullName: config.repositoryFullName,
                organizationId: config.organizationId,
                createdAt,
                suggestionsPerFile: config.suggestionsPerFile,
                minFiles: config.minFiles,
                maxFiles: config.maxFiles,
                minSuggestionsPerFile: config.minSuggestionsPerFile,
                maxSuggestionsPerFile: config.maxSuggestionsPerFile,
            });

            documents.push(prDocument);

            const automationUuid = randomUUID();
            automationUuids.push(automationUuid);

            const automationRow = buildAutomationExecutionRow({
                uuid: automationUuid,
                createdAt,
                status: automationFinalStatus,
                origin: config.origin,
                teamAutomationInfo: hydratedTeamAutomationInfo,
                repositoryId: config.repositoryId,
                repositoryName: config.repositoryName,
                repositoryFullName: config.repositoryFullName,
                prNumber,
                prTitle: prDocument.title,
            });

            automationRows.push(automationRow);

            const reviewRows = buildCodeReviewExecutionRows({
                automationExecutionUuid: automationUuid,
                createdAt,
                finalStatus: automationFinalStatus,
            });

            codeReviewRows.push(...reviewRows);
        }

        if (config.dryRun) {
            console.log('Dry run enabled. Generated preview:', {
                firstPullRequest: documents[0],
                firstAutomationExecution: automationRows[0],
                firstCodeReviewExecution: codeReviewRows[0],
            });
            return;
        }

        console.log('Inserting automation executions into Postgres...');
        await insertAutomationExecutions(pgClient, automationRows, codeReviewRows);
        console.log('Automation executions inserted.');

        console.log('Inserting pull requests into MongoDB...');
        try {
            await collection.insertMany(documents, { ordered: true });
        } catch (error) {
            console.error('Failed to insert pull requests. Rolling back Postgres rows...');
            try {
                await cleanupPostgres(pgClient, automationUuids);
            } catch (cleanupError) {
                console.error(
                    'Failed to rollback Postgres inserts. Manual cleanup required.',
                    cleanupError,
                );
            }
            throw error;
        }

        console.log('Seed completed successfully.', {
            insertedPullRequests: documents.length,
            organizationId: config.organizationId,
            repositoryId: config.repositoryId,
            teamAutomationId: config.teamAutomationId,
        });
    } finally {
        await Promise.allSettled([pgClient.end(), mongoClient.close()]);
    }
}

main().catch((error) => {
    console.error('Seed script failed:', error);
    process.exitCode = 1;
});
