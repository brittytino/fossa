import { RuleFeedbackType } from '@libs/fossyRules/domain/entities/ruleLike.entity';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetRuleFeedbackDto {
    @IsNotEmpty()
    @IsEnum(RuleFeedbackType, {
        message: 'feedback must be either "positive" or "negative"',
    })
    @ApiProperty({
        enum: RuleFeedbackType,
        enumName: 'RuleFeedbackType',
        example: RuleFeedbackType.POSITIVE,
    })
    feedback: RuleFeedbackType;
}
