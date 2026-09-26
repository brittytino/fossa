import {
    ReferenceDetectorService,
    escapeRegExp,
    stripControlMarkers,
} from '@libs/ai-engine/infrastructure/adapters/services/reference-detector.service';

jest.mock('@libs/core/log/logger', () => ({
    createLogger: () => ({
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    }),
}));

// Guards the CodeQL js/incomplete-sanitization fix (#890): the marker escape
// must cover ALL regex metacharacters, and the refactor into
// stripControlMarkers must preserve the previous behavior exactly.
describe('escapeRegExp', () => {
    it('escapes every regex metacharacter so the value matches literally', () => {
        const raw = 'a.b*c+d?(e)[f]{g}^h$i|j\\k';
        const re = new RegExp(escapeRegExp(raw));

        // The escaped pattern matches the literal string...
        expect(re.test(raw)).toBe(true);
        // ...and does NOT match a string where a metachar acted as a wildcard.
        expect(re.test('aXb*c+d?(e)[f]{g}^h$i|j\\k')).toBe(false);
    });

    it('leaves the current control markers intact (no behavior change)', () => {
        expect(escapeRegExp('@fossy-sync')).toBe('@fossy-sync');
        expect(escapeRegExp('@fossy-ignore')).toBe('@fossy-ignore');
    });
});

describe('stripControlMarkers', () => {
    it('removes @fossy-sync / @fossy-ignore case-insensitively, every occurrence', () => {
        expect(
            stripControlMarkers(
                'start @fossy-sync middle @FOSSY-IGNORE end @fossy-sync',
            ),
        ).toBe('start  middle  end ');
    });

    it('does not mangle text that contains regex-special characters', () => {
        // Regression guard: the old escape ignored `.` etc.; a complete escape
        // must still treat surrounding content as literal and untouched.
        const text = 'version 1.2.3 (stable) and cost is $5 @fossy-sync';
        expect(stripControlMarkers(text)).toBe(
            'version 1.2.3 (stable) and cost is $5 ',
        );
    });

    it('returns the text unchanged when there is no marker', () => {
        const text = 'See @AGENTS.md and @docs/standards.md';
        expect(stripControlMarkers(text)).toBe(text);
    });
});

describe('ReferenceDetectorService.extractMarkers', () => {
    const service = Object.create(
        ReferenceDetectorService.prototype,
    ) as ReferenceDetectorService;

    it('does NOT treat Fossa control markers as file references', () => {
        // Every rule file synced via the @fossy-sync marker used to get a
        // spurious "file not found: @fossy-sync" sync error on the rule.
        const markers = service.extractMarkers(
            'Rule body here.\n\n@fossy-sync\n\nAlso @FOSSY-SYNC and @fossy-ignore.',
            [],
        );
        expect(markers).toEqual([]);
    });

    it('still extracts real @file references', () => {
        const markers = service.extractMarkers(
            'See @AGENTS.md and @docs/standards.md for details. @fossy-sync',
            [],
        );
        expect(markers).toContain('@AGENTS.md');
        expect(markers).toContain('@docs/standards.md');
        expect(markers).not.toContain('@fossy-sync');
    });
});

// LLM path: the detector's model output itself can name control markers as
// files. The regex-path fix alone was NOT enough — reproduced live on the
// manual validation env ('File not found: @fossy-sync' on a clean rule).
jest.mock('@libs/llm/llm-call', () => ({
    // The shared executor also imports timeoutSignal + the budget constant;
    // mock them so the real runReviewCall path (now reached via LLM.run) doesn't
    // blow up on an undefined timeoutSignal.
    timeoutSignal: jest.fn(() => undefined),
    LLM_CALL_TIMEOUT_MS: 600000,
    tracedGenerateText: jest.fn().mockResolvedValue({
        text: JSON.stringify([
            { filePath: '@fossy-sync', originalText: '@fossy-sync' },
            // The EXACT production shape that escaped the first fix: the
            // model fabricates a repo prefix around the marker.
            {
                filePath: 'fossy-sync/@fossy-sync',
                fileName: 'fossy-sync/@fossy-sync',
                repositoryName: 'fossy-sync',
                originalText: '@fossy-sync',
            },
            {
                filePath: 'docs/real-file.md',
                originalText: '@docs/real-file.md',
            },
        ]),
    }),
}));
jest.mock('@libs/llm/byok-to-vercel', () => ({
    buildModelFromSlot: jest.fn().mockReturnValue({}),
    buildPlatformModel: jest.fn().mockReturnValue({}),
    getModelName: jest.fn().mockReturnValue('mock-model'),
    // Off-trial default: undefined override (the service falls back to the
    // resolved slot / env default). The service now calls this before building.
    trialDefaultModel: jest.fn().mockReturnValue(undefined),
}));
jest.mock('@libs/core/log/langfuse', () => ({
    buildLangfuseTelemetry: jest.fn().mockReturnValue({}),
    toAiSdkTelemetryArgs: jest.fn().mockReturnValue({ telemetry: {} }),
}));

describe('ReferenceDetectorService.detectReferences (LLM path)', () => {
    it('filters Fossa control markers from the model output', async () => {
        const { ReferenceDetectorService: Svc } = jest.requireActual(
            '@libs/ai-engine/infrastructure/adapters/services/reference-detector.service',
        );
        const service = Object.create(Svc.prototype);
        // logger is a field initializer (createLogger), which Object.create
        // skips — inject the mock directly.
        service.logger = {
            log: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };
        const refs = await service.detectReferences({
            requirementId: 'r1',
            promptText: 'rule body with @fossy-sync and @docs/real-file.md',
            organizationAndTeamData: { organizationId: 'o', teamId: 't' },
            detectionMode: 'rule',
        });

        expect(refs).toHaveLength(1);
        expect(refs[0].filePath).toBe('docs/real-file.md');
    });
});
