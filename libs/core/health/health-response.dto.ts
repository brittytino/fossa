import { ApiProperty } from '@nestjs/swagger';

export class HealthMemoryDto {
    @ApiProperty()
    status: string;
}

export class HealthApplicationDto {
    @ApiProperty()
    status: string;

    @ApiProperty()
    uptime: string;

    @ApiProperty()
    timestamp: string;

    @ApiProperty()
    environment: string;

    @ApiProperty({ type: HealthMemoryDto })
    memory: HealthMemoryDto;
}

export class HealthDatabaseServiceDto {
    @ApiProperty()
    status: string;
}

export class HealthDatabaseDto {
    @ApiProperty()
    status: string;

    @ApiProperty({ type: HealthDatabaseServiceDto })
    postgres: HealthDatabaseServiceDto;

    @ApiProperty({ type: HealthDatabaseServiceDto })
    mongodb: HealthDatabaseServiceDto;
}

export class HealthDetailsDto {
    @ApiProperty({ type: HealthApplicationDto })
    application: HealthApplicationDto;

    @ApiProperty({ type: HealthDatabaseDto })
    database: HealthDatabaseDto;
}

export class HealthCheckResponseDto {
    @ApiProperty()
    status: string;

    @ApiProperty()
    timestamp: string;

    @ApiProperty({ type: HealthDetailsDto })
    details: HealthDetailsDto;
}

export class HealthSimpleResponseDto {
    @ApiProperty()
    status: string;

    @ApiProperty()
    timestamp: string;

    @ApiProperty()
    message: string;

    @ApiProperty()
    uptime: number;
}
