import { AutomationMessage } from '@libs/automation/domain/automation/enum/automation-status';

export interface IStageValidationResult {
    canProceed: boolean;
    details?: {
        reasonCode?: AutomationMessage;
        message: string;
        technicalReason?: string;
        metadata?: Record<string, any>;
    };
}
