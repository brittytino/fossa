# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| `main` (latest) | ? Active |
| Older tagged releases | ?? Best-effort only |

Only the `main` branch and the most recent tagged release receive security fixes. Older releases are community-supported.

## Reporting a Vulnerability

**Please do NOT file a public GitHub issue for security vulnerabilities.**

Report security issues privately via one of these channels:

1. **GitHub Private Vulnerability Reporting** — use the [Security tab](https://github.com/brittytino/fossa/security/advisories/new) ? "Report a vulnerability".
2. **Email** — send a DM to [@brittytino](https://github.com/brittytino) on GitHub, or open a private advisory above.

### What to include

- A clear description of the vulnerability and its impact.
- The affected component (e.g. `apps/api`, `libs/identity`, a specific dependency).
- Steps to reproduce or a proof-of-concept (PoC).
- Any suggested mitigations you have already identified.

### Response timeline

| Stage | Target |
|-------|--------|
| Initial acknowledgement | Within **48 hours** |
| Triage & severity assessment | Within **5 business days** |
| Fix or workaround published | P0 within **7 days**, others within **30 days** |
| Public disclosure | Coordinated with reporter, after fix is shipped |

### Scope

In-scope:

- Auth & authorisation bypasses (`libs/identity`, JWT, OAuth, SAML SSO).
- Remote code execution or SSRF in any service.
- Sensitive data leakage (credentials, API keys, code content).
- Privilege escalation within the permission model.
- Critical dependency vulnerabilities with a clear exploitation path.

Out of scope:

- Issues only reproducible with administrative access already granted.
- Brute-force / rate-limit concerns without a realistic attack vector.
- Theoretical vulnerabilities without a working PoC.
- Self-hosted misconfiguration by the operator.

## Security design notes

- **No telemetry by default.** FOSSA does not phone home.
- **BYOK model.** LLM API keys are stored encrypted; never logged or sent upstream.
- **Fully self-hosted.** Runs air-gapped once Docker images are pulled.

## Acknowledgements

Researchers who responsibly disclose issues will be credited in the release notes and GitHub Security Advisory, unless they prefer to remain anonymous.
