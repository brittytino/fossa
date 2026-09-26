import { IsObject, IsOptional, IsString } from 'class-validator';

import {
    PullRequestMessageStatus,
    PullRequestMessageType,
} from '@libs/core/infrastructure/config/types/general/pullRequestMessages.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class PullRequestRepositoryDto {
    @IsString()
    @ApiProperty()
    id: string;

    @IsString()
    @ApiProperty()
    name: string;
}

export class PullRequestMessagesDto {
    @IsString()
    @ApiPropertyOptional()
    public organizationId?: string;

    @IsString()
    @ApiProperty({
        enum: PullRequestMessageType,
        enumName: 'PullRequestMessageType',
    })
    public pullRequestMessageType: PullRequestMessageType;

    @IsString()
    @ApiProperty({
        enum: PullRequestMessageStatus,
        enumName: 'PullRequestMessageStatus',
    })
    public status: PullRequestMessageStatus;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    public content: string;

    @IsObject()
    @ApiPropertyOptional({ type: PullRequestRepositoryDto })
    public repository?: PullRequestRepositoryDto;
}
