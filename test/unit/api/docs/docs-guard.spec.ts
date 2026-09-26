import type { Request, Response, NextFunction } from 'express';
import {
    buildDocsConfig,
    createDocsBasicAuthMiddleware,
    normalizePath,
} from '../../../../apps/api/src/docs/docs-guard';

describe('docs guard', () => {
    describe('normalizePath', () => {
        it('adds leading slash when missing', () => {
            expect(normalizePath('docs')).toBe('/docs');
        });

        it('keeps leading slash', () => {
            expect(normalizePath('/docs')).toBe('/docs');
        });
    });

    describe('buildDocsConfig', () => {
        it('uses defaults when env vars are missing', () => {
            const cfg = buildDocsConfig({} as NodeJS.ProcessEnv);
            expect(cfg.enabled).toBe(false);
            expect(cfg.docsPath).toBe('/docs');
            expect(cfg.specPath).toBe('/openapi.json');
        });

        it('reads env vars', () => {
            const cfg = buildDocsConfig({
                API_DOCS_ENABLED: 'true',
                API_DOCS_PATH: '/api-docs',
                API_DOCS_SPEC_PATH: '/spec.json',
            } as NodeJS.ProcessEnv);
            expect(cfg.enabled).toBe(true);
            expect(cfg.docsPath).toBe('/api-docs');
            expect(cfg.specPath).toBe('/spec.json');
        });
    });

    describe('Basic Auth', () => {
        const makeReq = (auth?: string) =>
            ({
                headers: auth ? { authorization: auth } : {},
            }) as unknown as Request;

        const makeRes = () => {
            const res = {
                statusCode: 200,
                headers: {} as Record<string, string>,
                setHeader(key: string, value: string) {
                    this.headers[key] = value;
                },
                status(code: number) {
                    this.statusCode = code;
                    return this;
                },
                end: jest.fn(),
            } as unknown as Response;
            return res;
        };

        it('returns 401 without auth header', () => {
            const mw = createDocsBasicAuthMiddleware('user', 'pass');
            const res = makeRes();
            mw(makeReq(), res, jest.fn() as NextFunction);
            expect(res.statusCode).toBe(401);
            expect(res.headers['WWW-Authenticate']).toBe('Basic');
        });

        it('returns 401 for invalid credentials', () => {
            const mw = createDocsBasicAuthMiddleware('user', 'pass');
            const res = makeRes();
            const bad = Buffer.from('user:wrong', 'utf8').toString('base64');
            mw(makeReq(`Basic ${bad}`), res, jest.fn() as NextFunction);
            expect(res.statusCode).toBe(401);
        });

        it('allows valid credentials', () => {
            const mw = createDocsBasicAuthMiddleware('user', 'pass');
            const res = makeRes();
            const next = jest.fn();
            const ok = Buffer.from('user:pass', 'utf8').toString('base64');
            mw(makeReq(`Basic ${ok}`), res, next as NextFunction);
            expect(next).toHaveBeenCalled();
        });
    });
});
