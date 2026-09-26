import { OrganizationAndTeamData } from '@libs/core/infrastructure/config/types/general/organizationAndTeamData';

export enum SubscriptionStatus {
    TRIAL = 'trial',
    ACTIVE = 'active',
    PAYMENT_FAILED = 'payment_failed',
    CANCELED = 'canceled',
    EXPIRED = 'expired',
    SELF_HOSTED = 'self-hosted',
    LICENSED_SELF_HOSTED = 'licensed-self-hosted',
}

export type OrganizationLicenseValidationResult = {
    valid: boolean;
    subscriptionStatus?: SubscriptionStatus;
    trialEnd?: Date;
    numberOfLicenses?: number;
    planType?: string;
    expiresAt?: string;
    byok?: boolean;
    creditBalanceUsd?: number;
};

export type UserWithLicense = {
    git_id: string;
    status?: 'active' | 'inactive';
};

export type ConsumeTrialReviewCreditResult = {
    allowed: boolean;
    reason?: string;
};

export type DebitCreditsResult = {
    applied: number;
    skipped: number;
    appliedUsd: number;
    balanceUsd: number;
    lowBalance: boolean;
    exhausted: boolean;
};

export const LICENSE_SERVICE_TOKEN = Symbol.for('LicenseService');

export interface ILicenseService {
    validateOrganizationLicense(
        organizationAndTeamData: OrganizationAndTeamData,
    ): Promise<OrganizationLicenseValidationResult>;

    getAllUsersWithLicense(
        organizationAndTeamData: OrganizationAndTeamData,
    ): Promise<UserWithLicense[]>;

    getAllUsersEverWithLicense(
        organizationAndTeamData: OrganizationAndTeamData,
    ): Promise<UserWithLicense[]>;

    assignLicense(
        organizationAndTeamData: OrganizationAndTeamData,
        userGitId: string,
        provider: string,
    ): Promise<boolean>;

    unassignLicenses(
        organizationAndTeamData: OrganizationAndTeamData,
        userGitIds: string[],
        provider: string,
    ): Promise<{ revoked: string[]; failed: string[] }>;

    consumeTrialReviewCredit(
        organizationAndTeamData: OrganizationAndTeamData,
        usageKey?: string,
    ): Promise<ConsumeTrialReviewCreditResult>;

    startTrial(
        organizationAndTeamData: OrganizationAndTeamData,
        byok: boolean,
    ): Promise<boolean>;

    getCreditBalance(
        organizationAndTeamData: OrganizationAndTeamData,
    ): Promise<any | null>;

    listCreditLedger(
        organizationAndTeamData: OrganizationAndTeamData,
        options?: any,
    ): Promise<any[]>;

    debitCredits(
        organizationAndTeamData: OrganizationAndTeamData,
        entries: any[],
    ): Promise<DebitCreditsResult>;

    createCreditCheckout(
        organizationAndTeamData: OrganizationAndTeamData,
        creditUsd: number,
    ): Promise<any | null>;
}
