import { PullRequestMessagesEntity } from '../entities/pullRequestMessages.entity';
import { IPullRequestMessages } from '../interfaces/pullRequestMessages.interface';

export const PULL_REQUEST_MESSAGES_REPOSITORY_TOKEN = Symbol(
    'PullRequestMessagesRepository',
);

export interface IPullRequestMessagesRepository {
    create(
        pullRequestMessages: IPullRequestMessages,
    ): Promise<PullRequestMessagesEntity>;

    update(
        pullRequestMessages: IPullRequestMessages,
    ): Promise<PullRequestMessagesEntity>;

    delete(uuid: string): Promise<void>;

    deleteByFilter(filter: Partial<IPullRequestMessages>): Promise<boolean>;

    find(
        filter?: Partial<IPullRequestMessages>,
    ): Promise<PullRequestMessagesEntity[]>;

    findOne(
        filter?: Partial<IPullRequestMessages>,
    ): Promise<PullRequestMessagesEntity | null>;

    findById(uuid: string): Promise<PullRequestMessagesEntity | null>;
}
