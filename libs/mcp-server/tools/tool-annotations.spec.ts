/**
 * Every Fossa MCP tool must declare what it does to state.
 *
 * Consumers derive behavior from these annotations instead of keeping their own
 * name lists: the conversation agent audits anything that is not `readOnlyHint`,
 * refuses to proactively offer anything `destructiveHint`, and offers exactly
 * the tools carrying a `proactiveHint`. An un-annotated tool would silently drop
 * out of that wiring, so the declaration is enforced here rather than trusted.
 */
import { CodeManagementTools } from './codeManagement.tools';
import { FossyIssuesTools } from './fossyIssues.tools';
import { FossyRulesTools } from './fossyRules.tools';
import { FossaIssuesTools } from './fossaIssues.tools';

// The tool builders only close over their services (used inside `execute`), so
// definitions can be listed without a container.
const stub = () => ({}) as never;

const ALL_TOOLS = [
    ...new FossyRulesTools(stub(), stub(), stub()).getAllTools(),
    ...new FossyIssuesTools(stub(), stub()).getAllTools(),
    ...new CodeManagementTools(stub()).getAllTools(),
    ...new FossaIssuesTools(stub()).getAllTools(),
];

const named = (name: string) => ALL_TOOLS.find((t) => t.name === name);

describe('Fossa MCP tool annotations', () => {
    it.each(ALL_TOOLS.map((t) => [t.name, t] as const))(
        '%s declares readOnlyHint',
        (_name, tool) => {
            expect(typeof tool.annotations?.readOnlyHint).toBe('boolean');
        },
    );

    it('marks the mutating tools as writes', () => {
        for (const name of [
            'FOSSA_CREATE_MEMORY',
            'FOSSA_CREATE_FOSSY_RULE',
            'FOSSA_UPDATE_FOSSY_RULE',
            'FOSSA_DELETE_FOSSY_RULE',
            'FOSSA_CREATE_FOSSY_ISSUE',
            'FOSSA_UPDATE_FOSSY_ISSUE_STATUS',
            'FOSSA_UPDATE_FOSSY_ISSUE_CATEGORY',
            'FOSSA_DELETE_FOSSY_ISSUE',
        ]) {
            expect(named(name)?.annotations?.readOnlyHint).toBe(false);
        }
    });

    it('marks the irreversible tools as destructive', () => {
        expect(named('FOSSA_DELETE_FOSSY_RULE')?.annotations?.destructiveHint).toBe(
            true,
        );
        expect(named('FOSSA_DELETE_FOSSY_ISSUE')?.annotations?.destructiveHint).toBe(
            true,
        );
    });

    it('never offers a destructive tool proactively', () => {
        const offerable = ALL_TOOLS.filter((t) => t.annotations?.proactiveHint);

        expect(offerable.length).toBeGreaterThan(0);
        for (const tool of offerable) {
            expect(tool.annotations?.readOnlyHint).toBe(false);
            expect(tool.annotations?.destructiveHint).not.toBe(true);
            expect(typeof tool.annotations?.proactiveHint).toBe('string');
        }
    });
});
