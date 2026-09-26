import { Transform } from 'class-transformer';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    @ApiPropertyOptional({ type: Number, minimum: 1, default: 1 })
    page?: number = 1;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    @Max(1000)
    @ApiPropertyOptional({
        type: Number,
        minimum: 1,
        maximum: 1000,
        default: 100,
    })
    limit?: number = 100;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(0)
    @ApiPropertyOptional({ type: Number, minimum: 0 })
    skip?: number;
}
