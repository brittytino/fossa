import { FossyRulesEntity } from '../entities/fossyRules.entity';
import {
    IFossyRule,
    IFossyRules,
    FossyRulesStatus,
} from '../interfaces/fossyRules.interface';

export const FOSSY_RULES_REPOSITORY_TOKEN = Symbol.for('FossyRulesRepository');

export interface IFossyRulesRepository {
    getNativeCollection(): any;

    create(
        fossyRules: Omit<IFossyRules, 'uuid'>,
    ): Promise<FossyRulesEntity | null>;

    findById(uuid: string): Promise<IFossyRule | null>;
    findOne(filter?: Partial<IFossyRules>): Promise<FossyRulesEntity | null>;
    find(filter?: Partial<IFossyRules>): Promise<FossyRulesEntity[]>;
    /** Projected list of org ids that have ≥1 rule — avoids loading every
     *  org's full embedded rules array (used by the detector sweep). */
    findOrganizationIdsWithRules(): Promise<string[]>;
    findByOrganizationId(
        organizationId: string,
    ): Promise<FossyRulesEntity | null>;

    /**
     * Count rules for an organization matching an optional status.
     * Implemented server-side via aggregation so callers don't need
     * to load the full embedded rules array just to read a number.
     */
    countRules(
        organizationId: string,
        status?: FossyRulesStatus,
    ): Promise<number>;

    /**
     * Counts rules per (repositoryId, directoryId) for an organization in a
     * single aggregation. Replaces fetching every repo's full rules array
     * client-side just to read a `.length` per card. `directoryId` is null
     * for repository-level rules.
     */
    countRulesByRepository(
        organizationId: string,
        statuses: FossyRulesStatus[],
    ): Promise<
        Array<{
            repositoryId: string;
            directoryId: string | null;
            count: number;
        }>
    >;

    update(
        uuid: string,
        updateData: Partial<IFossyRules>,
    ): Promise<FossyRulesEntity | null>;

    delete(uuid: string): Promise<boolean>;

    addRule(
        uuid: string,
        newRule: Partial<IFossyRule>,
    ): Promise<FossyRulesEntity | null>;
    updateRule(
        uuid: string,
        ruleId: string,
        updateData: Partial<IFossyRule>,
    ): Promise<FossyRulesEntity | null>;
    deleteRule(uuid: string, ruleId: string): Promise<boolean>;
    deleteRuleLogically(
        uuid: string,
        ruleId: string,
    ): Promise<FossyRulesEntity | null>;
    updateRulesStatusByFilter(
        organizationId: string,
        repositoryId: string,
        directoryId?: string,
        newStatus?: FossyRulesStatus,
    ): Promise<FossyRulesEntity | null>;
}
