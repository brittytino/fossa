# Backend Integration - Converting Tiptap JSON to Text

## Context

The prompt editor saves content as **Tiptap JSON** to preserve rich text formatting and MCP mentions (`@mcp<app|tool>`).

When **sending prompts to the LLM**, this JSON structure must be converted to **plain text**.

## Solution

### 1. Copy the Utility Function

Use `src/core/utils/tiptap-json-to-text.ts` in your backend or service. The function is **pure JavaScript/TypeScript** without dependencies on React or Tiptap.

### 2. Backend Usage

```typescript
import { convertTiptapJSONToText } from "./utils/tiptap-json-to-text";

// When receiving the prompt from the database (as a JSON string):
const promptFromDB =
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Analyze "},{"type":"mcpMention","attrs":{"app":"fossa","tool":"fossa_list_commits"}},{"type":"text","text":" for bugs"}]}]}';

// Convert to text before dispatching to the LLM:
const promptText = convertTiptapJSONToText(promptFromDB);
// Result: "Analyze @mcp<fossa|fossa_list_commits> for bugs"

// Now send promptText to the LLM
sendToLLM(promptText);
```

### 3. Where to Apply Conversion

Apply conversion **BEFORE sending to the LLM**:

- **Prompt fields that utilize the RichTextEditor:**
    - `v2PromptOverrides.generation.main.value`
    - `v2PromptOverrides.categories.descriptions.*.value`
    - `v2PromptOverrides.severity.flags.*.value`

### 4. Practical Example

```typescript
// Example: Service executing code review
async function processCodeReview(config: CodeReviewConfig) {
    const mainPrompt = convertTiptapJSONToText(
        config.v2PromptOverrides?.generation?.main?.value,
    );

    const bugPrompt = convertTiptapJSONToText(
        config.v2PromptOverrides?.categories?.descriptions?.bug?.value,
    );

    const fullPrompt = `
    ${mainPrompt}
    
    When analyzing for bugs:
    ${bugPrompt}
  `;

    return await sendToLLM(fullPrompt);
}
```

### 5. Compatibility

The function handles:

- ✅ JSON string: `'{"type":"doc",...}'`
- ✅ JSON object: `{ type: "doc", ... }`
- ✅ Plain text: `"hello world"` (returns as-is)
- ✅ Null/undefined: returns `""`

### 6. MCP Token Format

Tokens are preserved in the format:

```
@mcp<app_name|tool_name>
```

Examples:
- `@mcp<fossa|fossa_list_commits>`
- `@mcp<jira|search_issues>`

## Notes

- ⚠️ **DO NOT** send raw JSON directly to the LLM.
- ✅ **ALWAYS** convert using `convertTiptapJSONToText()` first.
- ✅ `@mcp<app|tool>` tokens are preserved in the resulting text.
- ✅ The function is idempotent.
