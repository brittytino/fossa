export enum PullRequestMessageType {
    START_REVIEW = 'start_review',
    END_REVIEW = 'end_review',
}

export enum PullRequestMessageStatus {
    EVERY_PUSH = 'every_push',
    ONLY_WHEN_OPENED = 'only_when_opened',
    OFF = 'off',
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export enum ConfigLevel {
    GLOBAL = 'global',
    REPOSITORY = 'repository',
    DIRECTORY = 'directory',
}
