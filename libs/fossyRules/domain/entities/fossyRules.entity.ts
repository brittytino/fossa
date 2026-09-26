import { Entity } from '@libs/core/domain/interfaces/entity';

import {
    IFossyRule,
    IFossyRules,
    FossyRulesScope,
} from '../interfaces/fossyRules.interface';

export class FossyRulesEntity implements Entity<IFossyRules> {
    private readonly _uuid: string;
    private readonly _organizationId: string;
    private readonly _rules: Partial<IFossyRule>[];
    private readonly _createdAt: Date;
    private readonly _updatedAt: Date;

    constructor(fossyRules: IFossyRules) {
        this._uuid = fossyRules.uuid;
        this._organizationId = fossyRules.organizationId;
        this._rules = fossyRules.rules;
        this._createdAt = fossyRules.createdAt;
        this._updatedAt = fossyRules.updatedAt;
    }

    private normalizeRules(rules: Partial<IFossyRule>[]): Partial<IFossyRule>[] {
        return rules.map((rule) => ({
            ...rule,
            scope: rule.scope ?? FossyRulesScope.FILE,
        }));
    }

    toJson(): IFossyRules {
        return {
            uuid: this._uuid,
            organizationId: this._organizationId,
            rules: this.normalizeRules(this._rules),
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        };
    }

    toObject(): IFossyRules {
        return {
            uuid: this._uuid,
            organizationId: this._organizationId,
            rules: this.normalizeRules(this._rules),
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        };
    }

    public static create(fossyRules: IFossyRules): FossyRulesEntity {
        return new FossyRulesEntity(fossyRules);
    }

    get uuid(): string {
        return this._uuid;
    }

    get organizationId(): string {
        return this._organizationId;
    }

    get rules(): Partial<IFossyRule>[] {
        return this.normalizeRules([...this._rules]);
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }
}
