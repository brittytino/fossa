import { HttpException, HttpStatus } from '@nestjs/common';

export class RepositoryWithDirectoriesException extends HttpException {
    constructor(
        message: string = 'Cannot delete repository with configured directories. Please delete all directories first before removing the repository.',
        error_key: string = 'REPOSITORY_WITH_DIRECTORIES',
    ) {
        super(
            {
                error_key: error_key,
                message,
                statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                error: 'Repository With Directories',
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
        );
    }
}
