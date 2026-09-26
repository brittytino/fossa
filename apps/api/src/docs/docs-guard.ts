import type { NextFunction, Request, Response } from 'express';

export type DocsConfig = {
    enabled: boolean;
    docsPath: string;
    specPath: string;
    basicUser: string;
    basicPass: string;
    servers: DocsServer[];
};

export type DocsServer = {
    url: string;
    description?: string;
};

export const normalizePath = (path: string) =>
    path.startsWith('/') ? path : `/${path}`;

const parseServers = (raw: string): DocsServer[] =>
    raw
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry): DocsServer | null => {
            const [url, description] = entry
                .split('|')
                .map((part) => part.trim())
                .filter(Boolean);
            if (!url) {
                return null;
            }
            return description ? { url, description } : { url };
        })
        .filter((entry): entry is DocsServer => entry !== null);

export const buildDocsConfig = (env: NodeJS.ProcessEnv): DocsConfig => ({
    enabled: env.API_DOCS_ENABLED === 'true',
    docsPath: normalizePath(env.API_DOCS_PATH || '/docs'),
    specPath: normalizePath(env.API_DOCS_SPEC_PATH || '/openapi.json'),
    basicUser: env.API_DOCS_BASIC_USER || '',
    basicPass: env.API_DOCS_BASIC_PASS || '',
    servers: parseServers(env.API_DOCS_SERVER_URLS || ''),
});

export const createDocsBasicAuthMiddleware =
    (user: string, pass: string) =>
    (req: Request, res: Response, next: NextFunction) => {
        if (!user || !pass) {
            res.setHeader('WWW-Authenticate', 'Basic');
            return res.status(401).end();
        }
        const auth = req.headers.authorization || '';
        if (!auth.startsWith('Basic ')) {
            res.setHeader('WWW-Authenticate', 'Basic');
            return res.status(401).end();
        }
        const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf8');
        const [u, p] = decoded.split(':');
        if (u !== user || p !== pass) {
            res.setHeader('WWW-Authenticate', 'Basic');
            return res.status(401).end();
        }
        return next();
    };
