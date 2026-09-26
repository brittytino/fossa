export type RepositoryFile = {
    path: string;
    type: string;
    filename: string;
    sha: string;
    size: number;
};

export type RepositoryFileWithContent = RepositoryFile & {
    content: string;
};
