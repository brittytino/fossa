import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileDto {
    @ApiProperty()
    public readonly name: string;
    @ApiProperty()
    public readonly phone: string;
    @ApiPropertyOptional()
    public readonly img?: string;
}
