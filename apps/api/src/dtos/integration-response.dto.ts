import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseBaseDto } from './api-response.dto';

export class IntegrationCloneStatusDto {
    @ApiProperty()
    status: boolean;
}

export class IntegrationCloneResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: IntegrationCloneStatusDto })
    data: IntegrationCloneStatusDto;
}
