import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseBaseDto } from './api-response.dto';

export class RuleLikeFeedbackDto {
    @ApiProperty()
    ruleId: string;

    @ApiProperty()
    userId: string;

    @ApiProperty({ example: 'negative' })
    feedback: string;

    @ApiProperty()
    createdAt: string;

    @ApiProperty()
    updatedAt: string;
}

export class RuleLikeFeedbackResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: RuleLikeFeedbackDto })
    data: RuleLikeFeedbackDto;
}
