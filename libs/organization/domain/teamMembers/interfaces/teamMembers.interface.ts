import { ICodeManagementMemberConfig } from './codeManagementMemberConfig.interface';
import { ICommuminicationMemberConfig } from './communicationMemberConfig.interface';
import { IProjectManagementMemberConfig } from './projectManagementMemberConfig';
import { TeamMemberRole } from '../enums/teamMemberRole.enum';
import { Role } from '@libs/identity/domain/permissions/enums/permissions.enum';

export interface IMembers {
    uuid?: string;
    active: boolean;
    communicationId: string;
    teamRole: TeamMemberRole;
    role: Role;
    avatar?: string;
    name: string;
    communication?: { name: string; id: string; chatId?: string };
    codeManagement?: { name: string; id: string };
    projectManagement?: { name: string; id: string };
    email: string;
    userId?: string;
}

export interface ITeamMember<TOrg = any, TTeam = any, TUser = any> {
    uuid?: string;
    organization?: Partial<TOrg>;
    team?: Partial<TTeam>;
    user?: Partial<TUser>;
    status: boolean;
    communicationId?: string;
    avatar?: string;
    name?: string;
    teamRole: TeamMemberRole;
    communication?: ICommuminicationMemberConfig;
    codeManagement?: ICodeManagementMemberConfig;
    projectManagement?: IProjectManagementMemberConfig;
    createdAt?: Date;
}

export interface IInviteResult {
    email: string;
    status: 'invite_sent' | 'user_already_registered_in_other_organization';
    uuid?: string;
    message: string;
}

export interface IUpdateOrCreateMembersResponse {
    success: boolean;
    results: IInviteResult[];
}
