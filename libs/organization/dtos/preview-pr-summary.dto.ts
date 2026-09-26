import { BehaviourForExistingDescription } from '@libs/core/infrastructure/config/types/general/codeReview.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';

export class PreviewPrSummaryDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: '128' })
    prNumber: string;

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: { id: '1135722979', name: 'fossa-ai' },
    })
    repository: {
        id: string;
        name: string;
    };

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'c33ef663-70e7-4f43-9605-0bbef979b8e0' })
    teamId: string;

    @IsNotEmpty()
    @IsEnum(BehaviourForExistingDescription)
    @ApiProperty({
        enum: BehaviourForExistingDescription,
        enumName: 'BehaviourForExistingDescription',
    })
    behaviourForExistingDescription: BehaviourForExistingDescription;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        example: 'Focus on security and error handling for the summary.',
    })
    customInstructions: string;
}
