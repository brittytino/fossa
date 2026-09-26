import { Injectable } from '@nestjs/common';
import { OrganizationAndTeamData } from '@libs/core/infrastructure/config/types/general/organizationAndTeamData';
import {
    ConsumeTrialReviewCreditResult,
    DebitCreditsResult,
    ILicenseService,
    OrganizationLicenseValidationResult,
    SubscriptionStatus,
    UserWithLicense,
} from '../interfaces/license.interface';

/**
 * FOSSA License Service (Open Source / Self-Hosted Default)
 * Always grants full, unrestricted access to all platform features.
 */
@Injectable()
export class FossaLicenseService implements ILicenseService {
    async validateOrganizationLicense(
        _organizationAndTeamData: OrganizationAndTeamData,
    ): Promise<OrganizationLicenseValidationResult> {
        return {
            valid: true,
            subscriptionStatus: SubscriptionStatus.ACTIVE,
            numberOfLicenses: 999999,
            planType: 'fossa_oss',
            byok: true,
        };
    }

    async getAllUsersWithLicense(
        _organizationAndTeamData: OrganizationAndTeamData,
    ): Promise<UserWithLicense[]> {
        return [];
    }

    async getAllUsersEverWithLicense(
        _organizationAndTeamData: OrganizationAndTeamData,
    ): Promise<UserWithLicense[]> {
        return [];
    }

    async assignLicense(
        _organizationAndTeamData: OrganizationAndTeamData,
        _userGitId: string,
        _provider: string,
    ): Promise<boolean> {
        return true;
    }

    async unassignLicenses(
        _organizationAndTeamData: OrganizationAndTeamData,
        userGitIds: string[],
        _provider: string,
    ): Promise<{ revoked: string[]; failed: string[] }> {
        return { revoked: userGitIds, failed: [] };
    }

    async consumeTrialReviewCredit(
        _organizationAndTeamData: OrganizationAndTeamData,
        _usageKey?: string,
    ): Promise<ConsumeTrialReviewCreditResult> {
        return { allowed: true };
    }

    async startTrial(
        _organizationAndTeamData: OrganizationAndTeamData,
        _byok: boolean,
    ): Promise<boolean> {
        return true;
    }

    async getCreditBalance(
        _organizationAndTeamData: OrganizationAndTeamData,
    ): Promise<any | null> {
        return null;
    }

    async listCreditLedger(
        _organizationAndTeamData: OrganizationAndTeamData,
        _options?: any,
    ): Promise<any[]> {
        return [];
    }

    async debitCredits(
        _organizationAndTeamData: OrganizationAndTeamData,
        _entries: any[],
    ): Promise<DebitCreditsResult> {
        return {
            applied: 0,
            skipped: 0,
            appliedUsd: 0,
            balanceUsd: 0,
            lowBalance: false,
            exhausted: false,
        };
    }

    async createCreditCheckout(
        _organizationAndTeamData: OrganizationAndTeamData,
        _creditUsd: number,
    ): Promise<any | null> {
        return null;
    }
}
