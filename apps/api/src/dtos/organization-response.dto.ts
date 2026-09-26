import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseBaseDto } from './api-response.dto';

export class OrganizationLanguageDto {
    @ApiProperty({ nullable: true })
    language: string | null;
}

export class OrganizationLanguageResponseDto extends ApiResponseBaseDto {
    @ApiProperty({ type: OrganizationLanguageDto })
    data: OrganizationLanguageDto;
}
