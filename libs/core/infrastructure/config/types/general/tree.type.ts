export interface TreeItem {
    path: string;
    type: 'file' | 'directory';
    sha: string;
    size?: number;
    url: string;
    hasChildren: boolean;
}
