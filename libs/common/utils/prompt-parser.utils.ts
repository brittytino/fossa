import { createHash } from 'crypto';

/**
 * Extracts a JSON object or array from a string, handling markdown code fences.
 * @param text The string containing JSON
 * @returns The parsed JSON object/array or null if parsing fails
 */
export function extractJsonFromResponse(
    text: string | null | undefined,
): any[] | null {
    if (!text || typeof text !== 'string') return null;

    let s = text.trim();

    const fenceMatch = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch && fenceMatch[1]) s = fenceMatch[1].trim();

    if (s.startsWith('"') && s.endsWith('"')) {
        try {
            s = JSON.parse(s);
        } catch {
            /* ignore */
        }
    }

    const start = s.indexOf('[');
    const end = s.lastIndexOf(']');
    if (start >= 0 && end > start) s = s.slice(start, end + 1);

    try {
        const parsed = JSON.parse(s);
        return Array.isArray(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

/**
 * Calculates SHA-256 hash of a prompt string
 * @param promptText The prompt text to hash
 * @returns Hex string of the hash
 */
export function calculatePromptHash(promptText: string): string {
    return createHash('sha256').update(promptText).digest('hex');
}
