import assert from "node:assert/strict";
import { test } from "node:test";

import {
    CLOUD_TENANTS,
    registryRepoFor,
    validateGithubRepoIsolation,
    type TenantSpec,
} from "../cloud-tenant-registry.js";

// The registry IS the code-level source of truth the runner falls back to
// when the CLOUD_TENANTS_JSON secret is stale (the 2026-06-03 environment-
// secret shadowing incident). These tests pin the invariants that fallback
// relies on.

test("every github PAT tenant has its own dedicated repo (no sharing)", () => {
    // Throws on violation — the module already runs this at import time,
    // but assert explicitly so a regression names THIS invariant.
    assert.doesNotThrow(() => validateGithubRepoIsolation(CLOUD_TENANTS));
    const githubRepos = CLOUD_TENANTS.filter(
        (t) => t.provider === "github",
    ).map((t) => t.repoFullName);
    assert.ok(githubRepos.length >= 4, "expected the standing github tiers");
    assert.equal(new Set(githubRepos).size, githubRepos.length);
});

test("registryRepoFor resolves the per-tier github fixture repos", () => {
    assert.equal(
        registryRepoFor("github", "paid"),
        "fossa-e2e/tiny-url-cloud-paid",
    );
    assert.equal(
        registryRepoFor("github", "trial"),
        "fossa-e2e/tiny-url-cloud-trial",
    );
    assert.equal(
        registryRepoFor("github", "free"),
        "fossa-e2e/tiny-url-cloud-free",
    );
    assert.equal(
        registryRepoFor("github", "community-byok"),
        "fossa-e2e/tiny-url-cloud-community",
    );
    // Unknown (provider, license) combos resolve to undefined, never throw —
    // the runner decides whether that's fatal (github) or fine (others).
    assert.equal(registryRepoFor("github", "license-paid"), undefined);
    assert.equal(registryRepoFor("gitlab", "trial"), undefined);
});

test("validateGithubRepoIsolation rejects shared and missing repos", () => {
    const shared: TenantSpec[] = [
        {
            email: "a@fossa.local",
            name: "A",
            license: "paid",
            provider: "github",
            repoFullName: "fossa-e2e/dup",
        },
        {
            email: "b@fossa.local",
            name: "B",
            license: "trial",
            provider: "github",
            repoFullName: "fossa-e2e/dup",
        },
    ];
    assert.throws(
        () => validateGithubRepoIsolation(shared),
        /shared by a@fossa\.io and b@fossa\.io/,
    );

    const missing: TenantSpec[] = [
        {
            email: "c@fossa.local",
            name: "C",
            license: "paid",
            provider: "github",
        },
    ];
    assert.throws(
        () => validateGithubRepoIsolation(missing),
        /no dedicated repoFullName/,
    );

    // Non-github providers may share / omit repos freely.
    const others: TenantSpec[] = [
        {
            email: "d@fossa.local",
            name: "D",
            license: "paid",
            provider: "gitlab",
            repoFullName: "fossa-e2e/shared",
        },
        {
            email: "e@fossa.local",
            name: "E",
            license: "trial",
            provider: "bitbucket",
            repoFullName: "fossa-e2e/shared",
        },
    ];
    assert.doesNotThrow(() => validateGithubRepoIsolation(others));
});
