import { Injectable } from '@nestjs/common';

@Injectable()
export class AutoAssignLicenseUseCase {
    async execute(_params?: any): Promise<{
        shouldProceed: boolean;
        reason:
            | 'FREEBIE'
            | 'ASSIGNED'
            | 'ALREADY_LICENSED'
            | 'ASSIGNMENT_FAILED'
            | 'AUTO_ASSIGN_DISABLED'
            | 'NOT_ENOUGH_PRS'
            | 'IGNORED_USER'
            | 'NOT_ALLOWED_USER';
    }> {
        // In FOSSA, all users have full access without seat licensing restrictions
        return { shouldProceed: true, reason: 'ALREADY_LICENSED' };
    }
}
