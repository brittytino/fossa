import {
    buildContextBlock,
    buildSystemPrompt,
    buildUserPrompt,
    type ConversationThreadContext,
} from './conversation-prompt';

const ORG = { organizationId: 'org-1', teamId: 'team-1' };

const THREAD: ConversationThreadContext = {
    gitUser: { id: 7, username: 'dev-one' },
    platformType: 'GITHUB',
    repository: { id: 'repo-1', name: 'billing-api' },
    pullRequest: { pullRequestNumber: 812, headRef: 'feat/x', baseRef: 'main' },
    pullRequestDescription: 'Adds retry handling.',
    codeManagementContext: {
        originalComment: {
            suggestionCommentId: 5150,
            suggestionFilePath: 'src/worker/invoice.ts',
            suggestionText: 'Wrap the external call in a try/catch.',
        },
        othersReplies: [{ historyConversationText: 'that is intentional' }],
    },
};

const userPrompt = (
    over: Partial<Parameters<typeof buildUserPrompt>[0]> = {},
) =>
    buildUserPrompt({
        prompt: '@fossy why?',
        userLanguage: 'en-US',
        prepareContext: THREAD,
        organizationAndTeamData: ORG,
        availableTools: ['FOSSA_FIND_MEMORIES'],
        hasSandbox: false,
        ...over,
    });

describe('buildSystemPrompt', () => {
    it('pins the reply to the team language', () => {
        const prompt = buildSystemPrompt('pt-BR');

        expect(prompt).toContain('Write your ENTIRE response in pt-BR');
        expect(prompt).toContain('LANGUAGE REQUIREMENTS (NON-NEGOTIABLE)');
    });
});

describe('buildContextBlock', () => {
    it('renders the thread the agent is answering in', () => {
        const block = buildContextBlock(THREAD);

        expect(block).toContain(
            'Pull request #812 (feat/x → main) in billing-api',
        );
        expect(block).toContain(
            '### Original Fossy suggestion (under discussion)',
        );
        expect(block).toContain('File: src/worker/invoice.ts');
        expect(block).toContain('- that is intentional');
    });

    it('names the rule behind the finding so it can be updated', () => {
        const block = buildContextBlock({
            ...THREAD,
            codeManagementContext: {
                ...THREAD.codeManagementContext,
                originalComment: {
                    ...THREAD.codeManagementContext!.originalComment,
                    suggestionId: 'sug-9',
                    label: 'fossy_rules',
                    brokenFossyRulesIds: ['rule-abc', 'rule-def'],
                },
            },
        });

        expect(block).toContain('fossy_rules');
        expect(block).toContain('rule-abc');
        expect(block).toContain('rule-def');
        expect(block).toContain('sug-9');
    });

    it('does not repeat a turn that the conversation record already carries', () => {
        const prompt = buildUserPrompt({
            prompt: '@fossy why?',
            userLanguage: 'en-US',
            organizationAndTeamData: ORG,
            availableTools: [],
            hasSandbox: false,
            prepareContext: {
                ...THREAD,
                codeManagementContext: {
                    ...THREAD.codeManagementContext,
                    othersReplies: [
                        { historyConversationText: 'that is intentional' },
                        {
                            historyConversationText:
                                'unrelated drive-by comment',
                        },
                    ],
                },
            },
            priorTurns: [
                { role: 'user', content: 'that is intentional' },
                { role: 'assistant', content: 'Understood.' },
            ],
        });

        // Present once, attributed, in the one place the thread is rendered.
        expect(prompt.match(/that is intentional/g)).toHaveLength(1);
        expect(prompt).toContain('Developer: that is intentional');
        expect(prompt).toContain('You: Understood.');
        // A comment nobody replayed is still context worth keeping.
        expect(prompt).toContain('unrelated drive-by comment');
        // One heading for the conversation, not one per source.
        expect(prompt.match(/### Conversation so far/g)).toHaveLength(1);
        expect(prompt).not.toContain('Earlier turns');
    });

    it('renders nothing without a context', () => {
        expect(buildContextBlock(undefined)).toBe('');
    });
});

describe('identifiers', () => {
    it('exposes every id a write tool needs to be callable', () => {
        const prompt = userPrompt();

        expect(prompt).toContain('organizationId: org-1');
        expect(prompt).toContain('teamId: team-1');
        expect(prompt).toContain('repositoryId: repo-1');
        expect(prompt).toContain('platformType: GITHUB');
        expect(prompt).toContain('pullRequestNumber: 812');
        expect(prompt).toContain('originalFossyCommentId: 5150');
        expect(prompt).toContain('dev-one');
        expect(prompt).toContain('7');
    });

    it('renders only the ids the thread actually carries', () => {
        const prompt = userPrompt({ prepareContext: undefined });

        expect(prompt).toContain('organizationId: org-1');
        expect(prompt).not.toContain('platformType:');
        expect(prompt).not.toContain('repositoryId:');
    });
});

// Shaped like what MCP reports for the Fossa tools — the guard spec in
// libs/mcp-server/tools pins the real declarations.
const ORG_TOOL_METADATA = {
    FOSSA_FIND_MEMORIES: { readOnlyHint: true },
    FOSSA_CREATE_MEMORY: {
        readOnlyHint: false,
        destructiveHint: false,
        proactiveHint: 'the developer explains a false positive',
    },
    FOSSA_CREATE_FOSSY_RULE: {
        readOnlyHint: false,
        destructiveHint: false,
        proactiveHint: 'the developer states a standard to enforce',
    },
    FOSSA_UPDATE_FOSSY_RULE: {
        readOnlyHint: false,
        destructiveHint: false,
        proactiveHint: 'the developer says a rule is too broad',
    },
    FOSSA_DELETE_FOSSY_RULE: { readOnlyHint: false, destructiveHint: true },
    FOSSA_CREATE_FOSSY_ISSUE: {
        readOnlyHint: false,
        destructiveHint: false,
        proactiveHint: 'the finding is real but out of scope for this PR',
    },
    FOSSA_UPDATE_FOSSY_ISSUE_STATUS: {
        readOnlyHint: false,
        destructiveHint: false,
        proactiveHint: 'a tracked issue is already fixed',
    },
    FOSSA_UPDATE_FOSSY_ISSUE_CATEGORY: {
        readOnlyHint: false,
        destructiveHint: false,
        proactiveHint: 'a finding is filed under the wrong category',
    },
    FOSSA_DELETE_FOSSY_ISSUE: { readOnlyHint: false, destructiveHint: true },
};

const ALL_WRITE_TOOLS = Object.keys(ORG_TOOL_METADATA);

const withOrgTools = {
    availableTools: ALL_WRITE_TOOLS,
    toolMetadata: ORG_TOOL_METADATA,
};

describe('proactive actions', () => {
    it('names each bound write tool and when to offer it', () => {
        const prompt = userPrompt(withOrgTools);

        expect(prompt).toContain('FOSSA_CREATE_MEMORY');
        expect(prompt).toContain('FOSSA_UPDATE_FOSSY_RULE');
        expect(prompt).toContain('FOSSA_CREATE_FOSSY_ISSUE');
        expect(prompt).toContain('FOSSA_UPDATE_FOSSY_ISSUE_STATUS');
        expect(prompt).toContain('FOSSA_UPDATE_FOSSY_ISSUE_CATEGORY');
        expect(prompt).toMatch(/false positive/i);
        expect(prompt).toMatch(/out of scope/i);
    });

    it('tells the agent to evaluate whether the exchange is worth persisting', () => {
        const prompt = userPrompt(withOrgTools);

        expect(prompt).toMatch(/durable/i);
        expect(prompt).toMatch(/offer/i);
    });

    it('keeps the write path opt-in behind the developer confirmation', () => {
        const prompt = userPrompt(withOrgTools);

        expect(prompt).toMatch(/Default to OFFERING/);
        expect(prompt).toMatch(/ONLY when/);
    });

    it('spells out that an explanation is not a request to act', () => {
        const prompt = userPrompt(withOrgTools);

        expect(prompt).toMatch(/is NOT a request to act/);
        expect(prompt).toMatch(/unsure whether you were asked, you were not/i);
    });

    it('forbids restating a past action as if it just happened', () => {
        const prompt = userPrompt(withOrgTools);

        expect(prompt).toMatch(/earlier turns/i);
        expect(prompt).toMatch(/THIS turn/);
    });

    it('tells the agent how to declare what it intends', () => {
        const prompt = userPrompt(withOrgTools);

        expect(prompt).toContain('fossaDecideAction');
        expect(prompt).toMatch(/exactly once/i);
        expect(prompt).toMatch(/'offer'/);
        expect(prompt).toMatch(/'act'/);
        expect(prompt).toMatch(/quote/i);
    });

    it('never advertises the destructive tools', () => {
        const prompt = userPrompt(withOrgTools);

        expect(prompt).not.toContain('FOSSA_DELETE_FOSSY_RULE');
        expect(prompt).not.toContain('FOSSA_DELETE_FOSSY_ISSUE');
    });

    it('offers a tool the org adds later without touching this code', () => {
        const prompt = userPrompt({
            availableTools: ['FOSSA_ARCHIVE_THREAD'],
            toolMetadata: {
                FOSSA_ARCHIVE_THREAD: {
                    readOnlyHint: false,
                    proactiveHint: 'the developer says the thread is settled',
                },
            },
        });

        expect(prompt).toContain('FOSSA_ARCHIVE_THREAD');
        expect(prompt).toContain('the developer says the thread is settled');
    });

    it('says nothing about acting when MCP bound no write tool', () => {
        const prompt = userPrompt({
            availableTools: ['FOSSA_FIND_MEMORIES'],
            toolMetadata: { FOSSA_FIND_MEMORIES: { readOnlyHint: true } },
        });

        expect(prompt).not.toMatch(/PROACTIVE ACTIONS/);
        expect(prompt).not.toContain('FOSSA_CREATE_MEMORY');
    });
});

describe('buildUserPrompt', () => {
    it('carries the context, the tools and the user message', () => {
        const prompt = userPrompt();

        expect(prompt).toContain('## Conversation context');
        expect(prompt).toContain('FOSSA_FIND_MEMORIES');
        expect(prompt).toContain('"repositoryId":"repo-1"');
        expect(prompt).toContain('USER MESSAGE:\n@fossy why?');
    });

    it('omits the memory tool when MCP did not bind it', () => {
        expect(userPrompt({ availableTools: [] })).not.toContain(
            'FOSSA_FIND_MEMORIES',
        );
    });

    it('lists the repo tools only when a sandbox is attached', () => {
        expect(userPrompt()).not.toContain('readFile');
        expect(userPrompt({ hasSandbox: true })).toContain('grep / readFile');
    });
});
