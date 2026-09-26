import * as JSON5 from 'json5';

type JsonValidator = (parsed: any) => boolean;

const transformToValidJSON = (input: string): string => {
    // Replaces unescaped single quotes with double quotes
    return input.replace(/(?<!\\)'/g, '"');
};

const extractValidJsonBlocks = (text: string): string[] => {
    const cleanText = text.replace(/^['"]|['"]$/g, '');
    const blocks: string[] = [];

    // Collect all ```json blocks that parse as valid JSON
    const jsonMatches = cleanText.matchAll(/```json([\s\S]*?)```/g);
    for (const match of jsonMatches) {
        try {
            JSON.parse(match[1].trim());
            blocks.push(match[1]);
        } catch {
            /* skip invalid */
        }
    }
    if (blocks.length > 0) return blocks;

    // Fallback: any code block with JSON-like content
    const genericMatches = cleanText.match(/```(?:\w*)\s*([\s\S]*?)```/g);
    if (genericMatches) {
        for (const block of genericMatches) {
            const content = block
                .replace(/^```\w*\s*/, '')
                .replace(/```$/, '')
                .trim();
            if (content.startsWith('{') || content.startsWith('[')) {
                blocks.push(content);
            }
        }
    }

    return blocks;
};

const stripCodeBlocks = (text: string): string => {
    const blocks = extractValidJsonBlocks(text);
    if (blocks.length > 0) return blocks[blocks.length - 1];
    return text.replace(/^['"]|['"]$/g, '');
};

const tryParseJSONObject = (payload: any, validator?: JsonValidator) => {
    try {
        const cleanedPayload = payload
            .replace(/\\\\n/g, '\\n') // Transform '\\\\n' into '\n'
            .replace(/\\'/g, "'") // Fix escaped single quotes
            .replace(/(\r\n|\n|\r)/gm, '') // Remove newlines outside of strings
            .replace(/\\\\"/g, '\\"');

        const parsedData: any = tryParseJSONObjectWithFallback(
            cleanedPayload,
            validator,
        );

        if (
            parsedData &&
            (typeof parsedData === 'object' || Array.isArray(parsedData))
        ) {
            return parsedData;
        }

        return null;
    } catch (err) {
        console.log('Error handling the return object from the LLM', err);
        return null;
    }
};

const tryParseJSONObjectWithFallback = (
    payload: any,
    validator?: JsonValidator,
) => {
    try {
        if (payload.length <= 0) {
            return null;
        }

        return JSON5.parse(payload);
    } catch (err) {
        try {
            return JSON.parse(payload);
        } catch (err2) {
            try {
                const validBlocks = extractValidJsonBlocks(payload);

                if (validBlocks.length > 0) {
                    // If validator provided, return the first block that passes
                    if (validator) {
                        for (const block of validBlocks) {
                            try {
                                const parsed = JSON.parse(block.trim());
                                if (validator(parsed)) return parsed;
                            } catch {
                                /* next block */
                            }
                        }
                    }

                    // No validator OR none passed → last valid block (current behavior)
                    const lastBlock = validBlocks[validBlocks.length - 1];
                    try {
                        return JSON.parse(lastBlock.trim());
                    } catch {
                        /* fall through to aggressive cleaning */
                    }

                    // Aggressive cleaning on last block (last resort)
                    const cleanedPayload = lastBlock
                        .replace(/\\n/g, '')
                        .replace(/\\/g, '')
                        .replace(/\/\*[\s\S]*?\*\//g, '')
                        .replace(/<[^>]*>/g, '')
                        .replace(/^`+|`+$/g, '')
                        .trim();
                    return JSON.parse(cleanedPayload);
                }

                // No code blocks → try stripped payload, then aggressive cleaning
                const noCodeBlocks = stripCodeBlocks(payload);
                try {
                    return JSON.parse(noCodeBlocks.trim());
                } catch {
                    /* fall through to aggressive cleaning */
                }
                const cleanedPayload = noCodeBlocks
                    .replace(/\\n/g, '')
                    .replace(/\\/g, '')
                    .replace(/\/\*[\s\S]*?\*\//g, '')
                    .replace(/<[^>]*>/g, '')
                    .replace(/^`+|`+$/g, '')
                    .trim();
                return JSON.parse(cleanedPayload);
            } catch (err3) {
                console.log(
                    'Error handling the return object from OpenAI',
                    err3,
                );
                return null;
            }
        }
    }
};

export { transformToValidJSON, tryParseJSONObject };
