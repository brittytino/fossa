export const AuditLogEvents = {
    CODE_REVIEW_CONFIG: 'audit.codeReviewConfig',
    FOSSY_RULES: 'audit.fossyRules',
    REPOSITORIES: 'audit.repositories',
    REPOSITORY_CONFIG_REMOVAL: 'audit.repositoryConfigRemoval',
    DIRECTORY_CONFIG_REMOVAL: 'audit.directoryConfigRemoval',
    INTEGRATION: 'audit.integration',
    USER_STATUS: 'audit.userStatus',
    PR_MESSAGES: 'audit.pullRequestMessages',
    USER_INVITE: 'audit.userInvite',
    USER_ROLE_CHANGE: 'audit.userRoleChange',
    USER_REPO_ACCESS: 'audit.userRepoAccess',
    ORG_SETTINGS: 'audit.orgSettings',
    CLI_KEY: 'audit.cliKey',
} as const;

export interface AuditLogUserInfo {
    userId?: string;
    userEmail?: string;
}

export interface UserInviteLogParams {
    organizationAndTeamData: {
        organizationId: string;
        teamId?: string;
    };
    userInfo: AuditLogUserInfo;
    actionType: any;
    invitedUsers: Array<{
        email?: string;
        status?: any;
    }>;
}

export interface UserRoleChangeLogParams {
    organizationAndTeamData: {
        organizationId: string;
        teamId?: string;
    };
    userInfo: AuditLogUserInfo;
    actionType: any;
    targetUserEmail?: string;
    previousRole?: any;
    newRole?: any;
}

export interface UserRepoAccessLogParams {
    organizationAndTeamData: {
        organizationId?: string;
        teamId?: string;
    };
    userInfo: AuditLogUserInfo;
    actionType: any;
    targetUserEmail?: string;
    addedRepositories?: Array<{ id: string; name?: string }>;
    removedRepositories?: Array<{ id: string; name?: string }>;
}


