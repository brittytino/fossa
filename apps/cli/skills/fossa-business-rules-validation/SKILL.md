---
name: fossa-business-rules-validation
description: Use when the user wants Fossa to validate local diff changes against task requirements, acceptance criteria, or business rules via `fossa pr business-validation`, especially for implementation-vs-task or merge readiness checks.
license: MIT
compatibility: Requires Fossa CLI auth plus Fossa task-management integration (Jira/Linear/Notion/ClickUp) for useful task context retrieval.
metadata:
    author: Fossa
    version: '1.0'
---

# Fossa Business Rules Validation

## Goal

Run Fossa business-rules validation from the current repository diff only.

## Required Inputs

- One local diff scope:
    - default working tree diff
    - or `--staged`
    - or `--branch <name>`
    - or `--commit <sha>`
    - or `[files...]`
- Optional task reference:
    - `--task-url <url>` or `--task-id <id>`
    - Do not pass both.

## When to Use

- The user asks for business-validation, business validation, business rules validation, or acceptance-criteria validation
- The user wants to check local implementation vs task requirements
- The user mentions local business validation or `fossa pr business-validation`

Do not use this skill as a substitute for `fossa review`. Local review and business-rules validation are different flows.

## Workflow

1. Choose the local scope.

- Default working tree diff when no scope flag is provided.
- Use only one of `--staged`, `--branch`, `--commit`, or `[files...]`.

2. Build and run the command.

Examples:

```bash
fossa pr business-validation
fossa pr business-validation --staged --task-id KC-1441
fossa pr business-validation --branch main --task-id KC-1441
fossa pr business-validation --commit HEAD~1 --task-id KC-1441
fossa pr business-validation src/service.ts src/use-case.ts --task-id KC-1441
```

3. Interpret the result.

- `Mode: local diff` means validation over the provided local diff scope.
- If output says missing MCP/task context, report that directly and request integration/context setup.

## Notes

- `fossa review` does not trigger this flow.
- Prefer `--task-id` or `--task-url` when the task is not obvious from local context.
- `KC-1441`-style keys are valid.
