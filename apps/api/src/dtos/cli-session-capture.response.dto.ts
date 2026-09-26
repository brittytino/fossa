import { ApiProperty } from '@nestjs/swagger';

export class CliSessionCapturePayloadDto {
    @ApiProperty({ example: 'cap_789xyz' })
    id: string;

    @ApiProperty({ example: true })
    accepted: boolean;
}

export class CliSessionCaptureResponseDto extends CliSessionCapturePayloadDto {
    @ApiProperty({ type: CliSessionCapturePayloadDto })
    data: CliSessionCapturePayloadDto;
}
