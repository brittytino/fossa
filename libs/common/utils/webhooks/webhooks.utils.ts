export const extractRepoFullName = (pullRequest: any): string => {
    if (!pullRequest) {
        return null;
    }

    const repository = pullRequest?.repository;
    if (typeof repository === 'string' && repository.includes('/')) {
        return repository;
    }

    return (
        repository?.full_name ||
        repository?.fullName ||
        repository?.path_with_namespace ||
        pullRequest?.base?.repo?.full_name ||
        pullRequest?.base?.repo?.fullName ||
        pullRequest?.head?.repo?.full_name ||
        pullRequest?.head?.repo?.fullName ||
        pullRequest?.target?.path_with_namespace ||
        pullRequest?.destination?.repository?.full_name ||
        pullRequest?.destination?.repository?.fullName ||
        null
    );
};
