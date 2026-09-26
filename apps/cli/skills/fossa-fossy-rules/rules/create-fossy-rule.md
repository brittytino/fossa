---
name: create-fossy-rule
description: Fossy Rule Creation Guidelines - Use when the user wants to create a new Fossy Rule for Fossa to follow when generating code.
---

# Fossy Rule Creation Guidelines

## Overview

When creating a new Fossy Rule, it's important to ensure that the rule is clear, actionable, and aligned with the overall goals of code generation. A well-defined Fossy Rule helps Fossy produce code that meets the user's expectations and project requirements.

## Workflow for Creating a Fossy Rule

1. **Collect the user's intent**: Understand the specific coding practice, style, or requirement that the user wants to enforce with the new Fossy Rule. Ask clarifying questions if necessary to ensure you have a clear understanding of the user's intent.

2. **Draft the Fossy Rule**: Based on the user's intent, draft a Fossy Rule that includes a clear description, title, and any relevant metadata such as severity and scope. Use the guidelines outlined in the "Guidelines for Creating a Fossy Rule" section to ensure the rule is well-structured and effective.

3. **Review the Fossy Rule with the user**: Present the drafted Fossy Rule to the user for feedback. Discuss any potential edge cases, exceptions, or clarifications needed to ensure the rule is comprehensive and actionable.

4. **Refine the Fossy Rule**: Based on the user's feedback, refine the Fossy Rule to address any concerns or suggestions. Ensure that the final version of the rule is clear, specific, and aligned with the user's goals.

5. **Save and Implement the Fossy Rule**: Once the Fossy Rule is finalized and approved by the user, save it. Send the title, rule, and any optional fields such as severity, scope, and path.

Use the following command to save the Fossy Rule:

```
fossa rules create --title <title> --rule <rule-content> [--repo-id <repository-id>] [--severity <severity-level>] [--scope <scope-level>] [--path <glob-pattern>]
```

6. **Communicate the new Fossy Rule**: Inform the user about the new Fossy Rule and how it will be applied in future code generation.

## Centralized Config Behavior

When centralized config is enabled, creating a rule may return centralized PR metadata instead of a direct rule record.

In this case, report PR details and clearly explain the rule will only apply after PR merge and sync.

## Guidelines for Creating a Fossy Rule

1. **Identify the Purpose**: Clearly define what the Fossy Rule is intended to achieve. Is it meant to enforce a coding style, ensure best practices, or address a specific use case?

2. **Be Specific**: The rule should be specific and unambiguous. Avoid vague language and ensure that the rule can be easily understood and applied by Fossy.

3. **Consider Edge Cases**: Think about any edge cases or exceptions that might arise when applying the rule. Address these in the rule definition to ensure Fossy can handle them appropriately.

4. **Align with Project Goals**: Ensure that the Fossy Rule aligns with the overall goals and requirements of the project. The rule should contribute to producing code that is maintainable, efficient, and meets the user's needs.

5. **Review and Refine**: After drafting the Fossy Rule, review it for clarity and completeness. Present it to the user for feedback and refine it as necessary to ensure it effectively guides Fossy's code generation process.
