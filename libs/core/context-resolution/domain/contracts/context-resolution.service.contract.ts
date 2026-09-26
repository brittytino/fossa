export const CONTEXT_RESOLUTION_SERVICE_TOKEN =
    'CONTEXT_RESOLUTION_SERVICE_TOKEN';

export interface IContextResolutionService {
    getTeamIdByOrganizationAndRepository(
        organizationId: string,
        repositoryId: string,
    ): Promise<string>;

    getDirectoryPathByOrganizationAndRepository(
        organizationId: string,
        repositoryId: string,
        directoryId: string,
    ): Promise<string>;

    getRepositoryNameByOrganizationAndRepository(
        organizationId: string,
        repositoryId: string,
    ): Promise<string>;
}
