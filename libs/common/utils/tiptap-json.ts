type TiptapNode = Record<string, unknown>;

function tryParseJSON(value: string): unknown {
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

function normalizeContent(
    content: string | object | null | undefined,
): string | TiptapNode | undefined {
    if (content === null || content === undefined) {
        return undefined;
    }

    if (typeof content === 'string') {
        const trimmed = content.trim();
        if (trimmed.startsWith('{')) {
            const parsed = tryParseJSON(trimmed);
            if (parsed && typeof parsed === 'object') {
                return parsed as TiptapNode;
            }
        }
        return content;
    }

    if (typeof content === 'object') {
        return content as TiptapNode;
    }

    return undefined;
}

export function convertTiptapJSONToText(
    content: string | object | null | undefined,
): string {
    const normalized = normalizeContent(content);
    if (normalized === undefined) {
        return '';
    }
    if (typeof normalized === 'string') {
        return normalized;
    }

    let result = '';

    const traverse = (node: TiptapNode): void => {
        if (!node) {
            return;
        }

        const type = node.type as string | undefined;

        switch (type) {
            case 'text':
                result += (node.text as string | undefined) ?? '';
                break;
            case 'hardBreak':
                result += '\n';
                break;
            case 'paragraph':
            case 'heading':
                (node.content as TiptapNode[] | undefined)?.forEach(traverse);
                result += '\n';
                break;
            case 'mcpMention': {
                const attrs = node.attrs as Record<string, unknown> | undefined;
                const resolved =
                    typeof attrs?.resolvedOutput === 'string'
                        ? attrs.resolvedOutput
                        : undefined;
                if (resolved) {
                    result += resolved;
                } else {
                    const app = typeof attrs?.app === 'string' ? attrs.app : '';
                    const tool =
                        typeof attrs?.tool === 'string' ? attrs.tool : '';
                    result += `@mcp<${app}|${tool}>`;
                }
                break;
            }
            default:
                (node.content as TiptapNode[] | undefined)?.forEach(traverse);
                break;
        }
    };

    traverse(normalized);

    return result.replace(/\n{3,}/g, '\n\n').trimEnd();
}

export function convertTiptapJSONToMarkdown(
    content: string | object | null | undefined,
    options?: { keepMcpMentions?: boolean },
): string {
    const normalized = normalizeContent(content);
    if (normalized === undefined) {
        return '';
    }
    if (typeof normalized === 'string') {
        return normalized;
    }

    let markdown = '';

    type ListContext = {
        inList?: boolean;
        listType?: 'bullet' | 'ordered';
        listIndex?: number;
    };

    const applyMarks = (text: string, marks: any[]): string => {
        if (!marks?.length) {
            return text;
        }
        return [...marks].reverse().reduce((acc, mark) => {
            switch (mark.type) {
                case 'bold':
                    return `**${acc}**`;
                case 'italic':
                    return `*${acc}*`;
                case 'code':
                    return `\`${acc}\``;
                case 'strike':
                    return `~~${acc}~~`;
                case 'link': {
                    const href =
                        typeof mark.attrs?.href === 'string'
                            ? mark.attrs.href
                            : '';
                    return href ? `[${acc}](${href})` : acc;
                }
                default:
                    return acc;
            }
        }, text);
    };

    const traverse = (node: TiptapNode, context?: ListContext): void => {
        if (!node) {
            return;
        }

        const type = node.type as string | undefined;

        switch (type) {
            case 'text': {
                const text = (node.text as string | undefined) ?? '';
                markdown += applyMarks(text, node.marks as any[] | undefined);
                return;
            }
            case 'hardBreak':
                markdown += '  \n';
                return;
            case 'mcpMention': {
                if (!options?.keepMcpMentions) {
                    return;
                }
                const attrs = node.attrs as Record<string, unknown> | undefined;
                const resolved =
                    typeof attrs?.resolvedOutput === 'string'
                        ? attrs.resolvedOutput
                        : undefined;
                if (resolved) {
                    markdown += `\`${resolved}\``;
                } else {
                    const app = typeof attrs?.app === 'string' ? attrs.app : '';
                    const tool =
                        typeof attrs?.tool === 'string' ? attrs.tool : '';
                    markdown += `\`@mcp<${app}|${tool}>\``;
                }
                return;
            }
            case 'paragraph': {
                const before = markdown.length;
                (node.content as TiptapNode[] | undefined)?.forEach((child) =>
                    traverse(child, context),
                );
                if (!context?.inList && markdown.length > before) {
                    markdown += '\n\n';
                }
                return;
            }
            case 'heading': {
                const attrs = node.attrs as Record<string, unknown> | undefined;
                const level =
                    typeof attrs?.level === 'number' ? attrs.level : 1;
                markdown += `${'#'.repeat(Math.max(1, level))} `;
                (node.content as TiptapNode[] | undefined)?.forEach((child) =>
                    traverse(child, context),
                );
                markdown += '\n\n';
                return;
            }
            case 'bulletList': {
                (node.content as TiptapNode[] | undefined)?.forEach((child) =>
                    traverse(child, {
                        inList: true,
                        listType: 'bullet',
                    }),
                );
                if (!context?.inList) {
                    markdown += '\n';
                }
                return;
            }
            case 'orderedList': {
                const attrs = node.attrs as Record<string, unknown> | undefined;
                let index = typeof attrs?.start === 'number' ? attrs.start : 1;
                (node.content as TiptapNode[] | undefined)?.forEach((child) =>
                    traverse(child, {
                        inList: true,
                        listType: 'ordered',
                        listIndex: index++,
                    }),
                );
                if (!context?.inList) {
                    markdown += '\n';
                }
                return;
            }
            case 'listItem': {
                const prefix =
                    context?.listType === 'ordered'
                        ? `${context.listIndex ?? 1}. `
                        : '- ';
                markdown += prefix;
                (node.content as TiptapNode[] | undefined)?.forEach((child) =>
                    traverse(child, context),
                );
                markdown += '\n';
                return;
            }
            case 'blockquote': {
                const before = markdown.length;
                (node.content as TiptapNode[] | undefined)?.forEach((child) =>
                    traverse(child, context),
                );
                if (markdown.length > before) {
                    const quote = markdown.substring(before).split('\n');
                    const quoted = quote
                        .map((line) => (line.trim() ? `> ${line}` : ''))
                        .join('\n');
                    markdown = markdown.substring(0, before) + quoted + '\n\n';
                }
                return;
            }
            case 'codeBlock': {
                const attrs = node.attrs as Record<string, unknown> | undefined;
                const language =
                    typeof attrs?.language === 'string' ? attrs.language : '';
                markdown += `\`\`\`${language}\n`;
                (node.content as TiptapNode[] | undefined)?.forEach((child) => {
                    if (child.type === 'text') {
                        markdown += child.text ?? '';
                    }
                });
                markdown += '\n```\n\n';
                return;
            }
            case 'horizontalRule':
                markdown += '---\n\n';
                return;
            default:
                (node.content as TiptapNode[] | undefined)?.forEach((child) =>
                    traverse(child, context),
                );
        }
    };

    traverse(normalized);

    return markdown.replace(/\n{3,}/g, '\n\n').trim();
}
