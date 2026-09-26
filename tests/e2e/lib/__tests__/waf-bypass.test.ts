import { strict as assert } from "node:assert";
import { test } from "node:test";
import { wafBypassHeader } from "../http.js";

// The WAF bypass secret must reach qa.*.fossa.local and NOTHING else — it's a
// WAF Allow key; leaking it to github.com/gitlab.com (or even prod
// app.fossa.local) hands third parties a bypass for the QA WAF.

test("wafBypassHeader: injects only for qa.*.fossa.local hosts", () => {
    process.env.QA_WAF_BYPASS_HEADER = "s3cret";
    try {
        assert.deepEqual(
            wafBypassHeader("https://qa.web.fossa.local/api/proxy/api/health"),
            { "x-fossa-e2e": "s3cret" },
        );
        assert.deepEqual(wafBypassHeader("https://qa.api.fossa.local/x"), {
            "x-fossa-e2e": "s3cret",
        });
        // NEVER to third parties or prod
        assert.deepEqual(wafBypassHeader("https://api.github.com/repos/x"), {});
        assert.deepEqual(wafBypassHeader("https://gitlab.com/api/v4"), {});
        assert.deepEqual(wafBypassHeader("https://app.fossa.local/login"), {});
        assert.deepEqual(wafBypassHeader("https://github.com/brittytino/fossa/"), {});
        // host-suffix spoofs must not match
        assert.deepEqual(wafBypassHeader("https://qa.web.fossa.local.evil.com/"), {});
        assert.deepEqual(wafBypassHeader("https://evilqa.web.fossa.local/"), {});
        // registerable-domain spoof: "evilfossa.local" must not satisfy the
        // fossa.local suffix (requires a dot boundary before "fossa.local")
        assert.deepEqual(wafBypassHeader("https://qa.evilfossa.local/"), {});
        // self-hosted droplets (bare IPs) get nothing
        assert.deepEqual(wafBypassHeader("http://10.0.0.5:3001/health"), {});
        // garbage URL → no header, no throw
        assert.deepEqual(wafBypassHeader("not a url"), {});
    } finally {
        delete process.env.QA_WAF_BYPASS_HEADER;
    }
});

test("wafBypassHeader: no-op when the env var is unset", () => {
    delete process.env.QA_WAF_BYPASS_HEADER;
    assert.deepEqual(
        wafBypassHeader("https://qa.web.fossa.local/api/proxy/api/health"),
        {},
    );
});
