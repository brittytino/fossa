---
name: view-fossy-rules
description: Fossy Rule Viewing Guidelines - Use when the user wants to view existing Fossy Rules that Fossa follows when generating code.
---

# Fossy Rule Viewing Guidelines

## Overview

When viewing existing Fossy Rules, it's important to understand the details of each rule, including its UUID, title, rule content, severity, scope, and any applicable file patterns. This information helps you understand how Fossy generates code and what guidelines it follows.

## Workflow for Viewing Fossy Rules

1. **Retrieve Rule Target**: If the user specified a particular rule(s) to view, identify it using one of:
    - `--title <title>`
    - `--uuid <uuid>`

If both are provided, prefer `--uuid`. If no specific rule is requested, prepare to display all existing Fossy Rules.

2. **Fetch Fossy Rules**: Use the appropriate command to fetch the Fossy Rule(s) based on the identified target(s). If no specific rule was requested, fetch all existing Fossy Rules.

Always include the repository id when fetching rules. Use `global` when the user does not provide one.

Use the following command to fetch Fossy Rules:

```
fossa rules view [--repo-id <repository-id>] [--uuid <uuid>] [--title <title>]
```

If `--repo-id` is omitted, the default repository id is `global`.

3. **Display Fossy Rules**: Present the retrieved Fossy Rule(s) in a clear and organized manner. For each rule, display the following information:
    - Rule UUID
    - Repository ID
    - Rule Title
    - Rule
    - Severity (if specified)
    - Scope (if specified)
    - Path (if specified)

Do not alter the content of the rules; display them as they are retrieved to ensure accuracy.

4. **Provide Context**: If the user is viewing a specific rule, provide additional context about how that rule is applied in code generation and any relevant examples or use cases.

5. **Answer Follow-up Questions**: Be prepared to answer any follow-up questions the user may have about the Fossy Rules, such as how to create or update rules, or how specific rules affect code generation.

## Centralized Config Context

When centralized config is enabled, rules may have pending centralized changes.

When relevant, highlight:

- centralized path (`centralizedConfig.path`)
- centralized status (`pending_add`, `pending_edit`, `pending_delete`, `synced`)
- whether a previously returned PR URL indicates pending application until merge and sync

## Guidelines for Viewing Fossy Rules

1. **Be Accurate**: When displaying Fossy Rules, ensure that the information is accurate and reflects the current state of the rules as retrieved from the system.

2. **Be Clear**: Present the Fossy Rules in a clear and organized manner, making it easy for the user to understand the details of each rule.

3. **Provide Context**: When appropriate, provide additional context about how specific Fossy Rules are applied in code generation and how they affect the output.

4. **Be Responsive**: Be prepared to answer any follow-up questions the user may have about the Fossy Rules, and provide helpful information to guide them in understanding and utilizing the rules effectively.
