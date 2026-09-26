import { IPullRequestMessagesRepository } from './pullRequestMessages.repository.contract';

export const PULL_REQUEST_MESSAGES_SERVICE_TOKEN = Symbol(
    'PullRequestMessagesService',
);

export interface IPullRequestMessagesService extends IPullRequestMessagesRepository {}
