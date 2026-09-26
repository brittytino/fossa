import { LibraryFossyRule } from '@libs/core/infrastructure/config/types/general/fossyRules.type';

export class PaginationMetadata {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export class PaginatedLibraryFossyRulesResponse {
    data: LibraryFossyRule[];
    pagination: PaginationMetadata;
}
