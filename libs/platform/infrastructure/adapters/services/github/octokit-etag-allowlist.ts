import type { Octokit } from '@octokit/core';

export type RouteRule = { method?: string; url: RegExp };

export const ALLOWLIST_TREES_ONLY: RouteRule[] = [
    { method: 'GET', url: /\/repos\/[^/]+\/[^/]+\/git\/trees\//i },
];

export const ALLOWLIST_TREES_AND_REPO: RouteRule[] = [
    { method: 'GET', url: /\/repos\/[^/]+\/[^/]+\/git\/trees\//i },
    { method: 'GET', url: /\/repos\/[^/]+\/[^/]+$/i },
];

export interface ETagCacheEntry<T = unknown> {
    etag: string;
    payload?: T;
    storedAt: number;
}

export interface ETagStore {
    get<T>(key: string): Promise<ETagCacheEntry<T> | undefined>;
    set<T>(
        key: string,
        value: ETagCacheEntry<T>,
        ttlSeconds?: number,
    ): Promise<void>;
}

function isGet(options: any) {
    return (options.method || 'GET').toUpperCase() === 'GET';
}

function matchRule(options: any, rules: RouteRule[]) {
    const m = (options.method || 'GET').toUpperCase();
    const u = String(options.url || '');
    return (
        rules.find(
            (r) =>
                (r.method ? r.method.toUpperCase() === m : m === 'GET') &&
                r.url.test(u),
        ) || null
    );
}

function buildResolvedKey(octokit: Octokit, options: any) {
    const resolved = (octokit as any).request.endpoint(options);
    const accept = (resolved.headers?.accept ?? '').toLowerCase();
    return `${(resolved.method || 'GET').toUpperCase()} ${resolved.url}#${accept}`;
}

const requestKeyMap = new WeakMap<any, string>();

export function attachETagHooksAllowlist(
    octokit: Octokit,
    store: ETagStore,
    allowlist: RouteRule[],
    cacheBody = true,
    retentionTtlSeconds = 24 * 60 * 60,
) {
    octokit.hook.before('request', async (options: any) => {
        if (!isGet(options) || !allowlist?.length) {
            return;
        }

        const rule = matchRule(options, allowlist);
        if (!rule) {
            return;
        }

        const key = buildResolvedKey(octokit, options);
        requestKeyMap.set(options, key);

        const cached = await store.get<any>(key);
        const shouldCondition = !!(
            cached?.etag && cached?.payload !== undefined
        );
        if (shouldCondition) {
            options.headers = {
                ...(options.headers || {}),
                'If-None-Match': cached!.etag,
            };
        }
    });

    octokit.hook.after('request', async (response: any, options: any) => {
        if (!isGet(options) || !allowlist?.length) {
            return;
        }

        const rule = matchRule(options, allowlist);
        if (!rule) {
            return;
        }

        const key =
            requestKeyMap.get(options) ?? buildResolvedKey(octokit, options);

        const etag = response.headers?.etag as string | undefined;
        if (!etag) {
            return;
        }

        const entry: ETagCacheEntry = {
            etag,
            payload: cacheBody ? response.data : undefined,
            storedAt: Date.now(),
        };
        await store.set(key, entry, retentionTtlSeconds);
    });

    octokit.hook.error('request', async (error: any, options: any) => {
        if (error?.status !== 304 || !isGet(options) || !allowlist?.length) {
            throw error;
        }

        const rule = matchRule(options, allowlist);
        if (!rule) {
            throw error;
        }

        const key =
            requestKeyMap.get(options) ?? buildResolvedKey(octokit, options);

        const cached = await store.get<any>(key);
        if (cached?.payload !== undefined) {
            const resp = error.response ?? {
                status: 304,
                headers: {},
                url: options.url,
                data: undefined,
            };
            return { ...resp, data: cached.payload };
        }

        const headers2 = { ...(options.headers || {}) };
        delete (headers2 as any)['If-None-Match'];
        return octokit.request({ ...options, headers: headers2 });
    });
}
