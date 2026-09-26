import {
    IPullRequestMessagesRepository,
    PULL_REQUEST_MESSAGES_REPOSITORY_TOKEN,
} from '@libs/code-review/domain/pullRequestMessages/contracts/pullRequestMessages.repository.contract';
import { IPullRequestMessagesService } from '@libs/code-review/domain/pullRequestMessages/contracts/pullRequestMessages.service.contract';
import { PullRequestMessagesEntity } from '@libs/code-review/domain/pullRequestMessages/entities/pullRequestMessages.entity';
import { IPullRequestMessages } from '@libs/code-review/domain/pullRequestMessages/interfaces/pullRequestMessages.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class PullRequestMessagesService implements IPullRequestMessagesService {
    constructor(
        @Inject(PULL_REQUEST_MESSAGES_REPOSITORY_TOKEN)
        private readonly pullRequestMessagesRepository: IPullRequestMessagesRepository,
    ) {}

    async create(
        pullRequestMessages: IPullRequestMessages,
    ): Promise<PullRequestMessagesEntity> {
        return this.pullRequestMessagesRepository.create(pullRequestMessages);
    }

    async update(
        pullRequestMessages: IPullRequestMessages,
    ): Promise<PullRequestMessagesEntity> {
        return this.pullRequestMessagesRepository.update(pullRequestMessages);
    }

    async delete(uuid: string): Promise<void> {
        return this.pullRequestMessagesRepository.delete(uuid);
    }

    async find(
        filter?: Partial<IPullRequestMessages>,
    ): Promise<PullRequestMessagesEntity[]> {
        return this.pullRequestMessagesRepository.find(filter);
    }

    async findOne(
        filter?: Partial<IPullRequestMessages>,
    ): Promise<PullRequestMessagesEntity | null> {
        return this.pullRequestMessagesRepository.findOne(filter);
    }

    async findById(uuid: string): Promise<PullRequestMessagesEntity | null> {
        return this.pullRequestMessagesRepository.findById(uuid);
    }

    async deleteByFilter(
        filter: Partial<IPullRequestMessages>,
    ): Promise<boolean> {
        return this.pullRequestMessagesRepository.deleteByFilter(filter);
    }
}
