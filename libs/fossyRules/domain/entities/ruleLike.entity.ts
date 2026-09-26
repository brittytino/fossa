import { Entity } from '@libs/core/domain/interfaces/entity';

export enum RuleFeedbackType {
    POSITIVE = 'positive',
    NEGATIVE = 'negative',
}

export interface IRuleLike {
    _id?: string;
    ruleId: string;
    userId?: string;
    feedback: RuleFeedbackType;
    createdAt?: Date;
    updatedAt?: Date;
}

export class RuleLikeEntity implements Entity<IRuleLike> {
    private readonly _id?: string;
    private readonly _ruleId: string;
    private readonly _userId?: string;
    private readonly _feedback: RuleFeedbackType;
    private readonly _createdAt?: Date;
    private readonly _updatedAt?: Date;

    constructor(props: IRuleLike) {
        this._id = props._id;
        this._ruleId = props.ruleId;
        this._userId = props.userId;
        this._feedback = props.feedback;
        this._createdAt = props.createdAt;
        this._updatedAt = props.updatedAt;
    }

    static create(props: IRuleLike): RuleLikeEntity {
        return new RuleLikeEntity(props);
    }

    toJson(): IRuleLike {
        return this.toObject();
    }

    toObject(): IRuleLike {
        return {
            _id: this._id,
            ruleId: this._ruleId,
            userId: this._userId,
            feedback: this._feedback,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        };
    }

    get id(): string | undefined {
        return this._id;
    }
    get ruleId(): string {
        return this._ruleId;
    }
    get userId(): string | undefined {
        return this._userId;
    }
    get feedback(): RuleFeedbackType {
        return this._feedback;
    }
    get createdAt(): Date | undefined {
        return this._createdAt;
    }
    get updatedAt(): Date | undefined {
        return this._updatedAt;
    }
}
