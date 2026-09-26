/**
 * Price-drift check for the Fossa provider catalog (the billing price list).
 *
 * The catalog in libs/llm/providers/fossa/catalog.ts pins each model's list
 * price in code — on purpose: a debit is only as honest as the number it was
 * computed from, and a runtime catalog fetch would let a vendor change what we
 * charge without a review. The flip side is drift: when a vendor moves a price
 * and nobody updates the catalog, Fossa eats (or overcharges) the difference.
 *
 * This script compares every catalog entry against models.dev (the same source
 * the analytics pricing catalog reads) and exits non-zero on any mismatch, so
 * it can run in CI on a schedule and in the PR that touches the catalog.
 *
 *   pnpm run fossa:catalog:check
 */
import { FOSSA_CATALOG, FOSSA_CATALOG_PRICES_AS_OF } from '../libs/llm/providers/fossa/catalog';
import { splitFossaModelId } from '../libs/llm/providers/fossa/model-id';

const MODELS_DEV = 'https://models.dev/api.json';
const TOLERANCE = 1e-6;

type Cost = { input?: number; output?: number; cache_read?: number; cache_write?: number };
type ModelsDev = Record<string, { models?: Record<string, { cost?: Cost }> }>;

const UPSTREAM_TO_MODELS_DEV: Record<string, string> = {
    fireworks: 'fireworks-ai',
    anthropic: 'anthropic',
    openai: 'openai',
    google: 'google',
};

async function main(): Promise<void> {
    const res = await fetch(MODELS_DEV, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) {
        throw new Error(`models.dev responded ${res.status}`);
    }
    const catalog = (await res.json()) as ModelsDev;

    const drift: string[] = [];
    const missing: string[] = [];

    for (const entry of FOSSA_CATALOG) {
        const ref = splitFossaModelId(entry.id);
        if (!ref || !entry.pricing) {
            drift.push(`${entry.id}: not a routable id or has no pricing`);
            continue;
        }
        const vendor = catalog[UPSTREAM_TO_MODELS_DEV[ref.upstream]];
        const cost = vendor?.models?.[ref.model]?.cost;
        if (!cost) {
            missing.push(`${entry.id}: not found on models.dev (renamed? retired?)`);
            continue;
        }
        const pairs: Array<[string, number | undefined, number | undefined]> = [
            ['input', entry.pricing.inputPerMillion, cost.input],
            ['output', entry.pricing.outputPerMillion, cost.output],
            ['cacheRead', entry.pricing.cacheReadPerMillion, cost.cache_read],
            ['cacheWrite', entry.pricing.cacheWritePerMillion, cost.cache_write],
        ];
        for (const [field, ours, theirs] of pairs) {
            if (theirs === undefined && ours === undefined) continue;
            if (theirs === undefined || ours === undefined) {
                drift.push(`${entry.id}.${field}: catalog=${ours ?? '—'} models.dev=${theirs ?? '—'}`);
                continue;
            }
            if (Math.abs(ours - theirs) > TOLERANCE) {
                drift.push(`${entry.id}.${field}: catalog=${ours} models.dev=${theirs}`);
            }
        }
    }

    console.log(
        `[fossa-catalog] ${FOSSA_CATALOG.length} models, prices as of ${FOSSA_CATALOG_PRICES_AS_OF}`,
    );
    for (const line of missing) console.warn(`[fossa-catalog] MISSING  ${line}`);
    for (const line of drift) console.error(`[fossa-catalog] DRIFT    ${line}`);

    if (drift.length > 0) {
        console.error(
            `\n[fossa-catalog] ${drift.length} price(s) differ from models.dev. ` +
                `Update libs/llm/providers/fossa/catalog.ts (and FOSSA_CATALOG_PRICES_AS_OF), ` +
                `or confirm models.dev is wrong before shipping.`,
        );
        process.exit(1);
    }
    // An entry models.dev cannot resolve was not checked at all — a renamed
    // or retired id must fail loudly, not pass as "matches".
    if (missing.length > 0) {
        console.error(
            `\n[fossa-catalog] ${missing.length} catalog id(s) not found on models.dev; ` +
                `fix the id (or the upstream mapping) before shipping.`,
        );
        process.exit(1);
    }
    console.log('[fossa-catalog] OK — catalog matches models.dev.');
}

main().catch((err) => {
    console.error('[fossa-catalog] check failed:', err instanceof Error ? err.message : err);
    process.exit(2);
});
