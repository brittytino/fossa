---
name: fossa-review
description: Use when the user wants Fossa to review local changes, run `fossa review` or `--prompt-only`, fix Fossa review findings, or check commit, push, or merge readiness.
---

# Fossa Review

## Goal

Use the Fossa CLI to review changes and resolve issues. Prefer machine-friendly output via `--prompt-only`, then apply fixes in code.

If the request is to validate local changes against business rules, task requirements, or acceptance criteria, use `fossa-business-rules-validation` instead. `fossa review` does not trigger local business validation.

## Trigger Hints

- Treat mentions of `review`, `commit`, `push`, `open PR`, `merge`, `quality gate`, or `ready to ship` as triggers for this skill.
- For commit/push/merge requests, proactively ask to run Fossa review first when a fresh review has not run yet in the current task.

## Workflow

1. Ensure Fossa CLI is available.

- Run `fossa --help` to confirm.
- If missing, ask the user to install the CLI and stop.

2. Ensure authentication if required.

- If `fossa review` fails with auth, ask the human to authenticate with `fossa auth login` in their terminal, then retry after they confirm.
- For team keys, use `fossa auth team-key --key <key>` when provided by the user.

3. Run review using prompt-only output.

- Default: `fossa review --prompt-only`.
- If user specifies files: `fossa review --prompt-only <files...>`.
- If user asks for staged/commit/branch: add `--staged`, `--commit <sha>`, or `--branch <name>`.
- If user wants fast: add `--fast`.

4. Parse results and apply fixes.

- Use the output to locate files and lines.
- Make minimal, targeted changes to address each issue.
- If an issue is not actionable or is a false positive, explain why and skip.

5. Re-run review if needed.

- After fixes, rerun `fossa review --prompt-only` to confirm issues are resolved.

## Notes

- Prefer `--prompt-only` for predictable parsing.
- Avoid `--interactive` unless the user explicitly asks.
- Redirect PR-vs-task validation requests to `fossa-business-rules-validation`.
- Use `review --help` to undertstand review possibilities
