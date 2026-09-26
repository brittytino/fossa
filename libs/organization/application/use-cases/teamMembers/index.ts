import { CreateOrUpdateTeamMembersUseCase } from './create.use-case';
import { DeleteTeamMembersUseCase } from './delete.use-case';
import { GetTeamMembersUseCase } from './get-team-members.use-case';

export const UseCases = [
    CreateOrUpdateTeamMembersUseCase,
    GetTeamMembersUseCase,
    DeleteTeamMembersUseCase,
];
