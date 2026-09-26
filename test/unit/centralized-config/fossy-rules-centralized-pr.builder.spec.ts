import * as yaml from 'js-yaml';

import { formatRuleToYaml } from '@libs/centralized-config/utils/fossy-rules-centralized-pr.builder';
import {
    FossyRulesExampleDto,
    FossyRulesInheritanceDto,
} from '@libs/fossyRules/dtos/create-fossy-rule.dto';
import { FossyRulesStatus } from '@libs/fossyRules/domain/interfaces/fossyRules.interface';

describe('formatRuleToYaml — enabled field', () => {
    const base = { title: 'No console.log', rule: 'Do not commit console.log' };

    it('omits enabled for an active rule (active files unchanged)', () => {
        const parsed = yaml.load(
            formatRuleToYaml({ ...base, status: FossyRulesStatus.ACTIVE }),
        ) as Record<string, unknown>;
        expect('enabled' in parsed).toBe(false);
    });

    it('omits enabled when status is absent', () => {
        const parsed = yaml.load(formatRuleToYaml(base)) as Record<
            string,
            unknown
        >;
        expect('enabled' in parsed).toBe(false);
    });

    it('emits enabled: false for a paused rule', () => {
        const parsed = yaml.load(
            formatRuleToYaml({ ...base, status: FossyRulesStatus.PAUSED }),
        ) as Record<string, unknown>;
        expect(parsed.enabled).toBe(false);
    });
});

describe('formatRuleToYaml — Nest class instances', () => {
    const base = { title: 'No console.log', rule: 'Do not commit console.log' };

    it('dumps examples that are FossyRulesExampleDto class instances', () => {
        const example = new FossyRulesExampleDto();
        example.snippet = 'if (value == null) return;';
        example.isCorrect = false;

        const parsed = yaml.load(
            formatRuleToYaml({ ...base, examples: [example] }),
        ) as {
            examples: Array<{ snippet: string; isCorrect: boolean }>;
        };

        expect(parsed.examples).toEqual([
            { snippet: 'if (value == null) return;', isCorrect: false },
        ]);
    });

    it('dumps inheritance that is a FossyRulesInheritanceDto class instance', () => {
        const inheritance = new FossyRulesInheritanceDto();
        inheritance.inheritable = true;
        inheritance.include = ['src/**'];
        inheritance.exclude = ['src/legacy/**'];

        const parsed = yaml.load(
            formatRuleToYaml({ ...base, inheritance }),
        ) as {
            inheritance: {
                inheritable: boolean;
                include: string[];
                exclude: string[];
            };
        };

        expect(parsed.inheritance).toEqual({
            inheritable: true,
            include: ['src/**'],
            exclude: ['src/legacy/**'],
        });
    });
});
