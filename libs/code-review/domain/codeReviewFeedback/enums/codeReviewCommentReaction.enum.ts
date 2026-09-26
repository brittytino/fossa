export enum GitHubReaction {
    THUMBS_UP = '+1',
    THUMBS_DOWN = '-1',
    EYES = 'eyes',
    HOORAY = 'hooray',
    CONFUSED = 'confused',
    ROCKET = 'rocket',
}

export enum GitlabReaction {
    THUMBS_UP = 'thumbsup',
    THUMBS_DOWN = 'thumbsdown',
    EYES = 'eyes',
    TADA = 'tada',
    CONFUSED = 'confused',
    ROCKET = 'rocket',
    LOCK = 'lock',
}

export enum ForgejoReaction {
    THUMBS_UP = '+1',
    THUMBS_DOWN = '-1',
    LAUGH = 'laugh',
    HOORAY = 'hooray',
    CONFUSED = 'confused',
    HEART = 'heart',
    ROCKET = 'rocket',
    EYES = 'eyes',
}

export type Reaction = GitHubReaction | GitlabReaction | ForgejoReaction;

export enum CountingType {
    CREATE = 'create',
    REVOKE = 'revoke',
}

export enum ReviewStatusReaction {
    START = 'start',
    SUCCESS = 'success',
    ERROR = 'error',
    SKIP = 'skip',
}
