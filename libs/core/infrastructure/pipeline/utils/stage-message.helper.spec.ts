import { StageMessageHelper } from './stage-message.helper';
import { PipelineReason } from '../interfaces/pipeline-reason.interface';

describe('StageMessageHelper', () => {
    describe('skippedWithReason', () => {
        it('should return formatted string with message only', () => {
            const reason: PipelineReason = { message: 'Draft PR' };
            expect(StageMessageHelper.skippedWithReason(reason)).toBe(
                'Draft PR',
            );
        });

        it('should return formatted string with message and action', () => {
            const reason: PipelineReason = {
                message: 'Draft PR',
                action: 'Mark as Ready',
            };
            expect(StageMessageHelper.skippedWithReason(reason)).toBe(
                'Draft PR — Mark as Ready',
            );
        });

        it('should return formatted string with message and technical detail', () => {
            const reason: PipelineReason = { message: 'Draft PR' };
            expect(
                StageMessageHelper.skippedWithReason(
                    reason,
                    'runOnDraft=false',
                ),
            ).toBe('Draft PR (runOnDraft=false)');
        });

        it('should return formatted string with message, action and technical detail', () => {
            const reason: PipelineReason = {
                message: 'Draft PR',
                action: 'Mark as Ready',
            };
            expect(
                StageMessageHelper.skippedWithReason(
                    reason,
                    'runOnDraft=false',
                ),
            ).toBe('Draft PR — Mark as Ready (runOnDraft=false)');
        });
    });

    describe('skipped', () => {
        it('should return userMessage when no technicalReason provided', () => {
            const msg = 'Skipped stage';
            expect(StageMessageHelper.skipped(msg)).toBe(msg);
        });

        it('should return formatted string when technicalReason provided', () => {
            const msg = 'Skipped stage';
            const reason = 'Condition not met';
            expect(StageMessageHelper.skipped(msg, reason)).toBe(
                'Skipped stage (Tech: Condition not met)',
            );
        });
    });

    describe('error', () => {
        it('should return userMessage when no error provided', () => {
            const msg = 'Stage failed';
            expect(StageMessageHelper.error(msg)).toBe(msg);
        });

        it('should return formatted string with error message', () => {
            const msg = 'Stage failed';
            const error = new Error('Something went wrong');
            expect(StageMessageHelper.error(msg, error)).toBe(
                'Stage failed (Error: Something went wrong)',
            );
        });

        it('should return formatted string with string error', () => {
            const msg = 'Stage failed';
            const error = 'String error';
            expect(StageMessageHelper.error(msg, error)).toBe(
                'Stage failed (Error: String error)',
            );
        });

        it('should return formatted string with object error', () => {
            const msg = 'Stage failed';
            const error = { code: 500 };
            expect(StageMessageHelper.error(msg, error)).toBe(
                'Stage failed (Error: {"code":500})',
            );
        });
    });
});
