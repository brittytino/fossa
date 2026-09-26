import { IsEnum } from 'class-validator';

import { PlatformType } from '@libs/core/domain/enums/platform-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class PlatformTypeDto {
    @IsEnum(PlatformType)
    @ApiProperty({ enum: PlatformType, enumName: 'PlatformType' })
    platformType: PlatformType;
}
