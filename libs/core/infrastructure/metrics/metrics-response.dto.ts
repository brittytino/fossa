import { ApiProperty } from '@nestjs/swagger';

export class MetricsApiResponseBaseDto {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Object' })
    type: string;
}

export class MetricsErrorRateDto {
    @ApiProperty()
    component: string;

    @ApiProperty()
    totalRequests: number;

    @ApiProperty()
    totalErrors: number;

    @ApiProperty()
    errorRate: number;

    @ApiProperty()
    windowMinutes: number;
}

export class MetricsErrorRateResponseDto extends MetricsApiResponseBaseDto {
    @ApiProperty({ type: MetricsErrorRateDto, isArray: true })
    data: MetricsErrorRateDto[];
}

export class MetricsResponseTimeDto {
    @ApiProperty()
    p50: number;

    @ApiProperty()
    p95: number;

    @ApiProperty()
    avg: number;

    @ApiProperty()
    max: number;

    @ApiProperty()
    count: number;

    @ApiProperty()
    windowHours: number;
}

export class MetricsResponseTimeResponseDto extends MetricsApiResponseBaseDto {
    @ApiProperty({ type: MetricsResponseTimeDto })
    data: MetricsResponseTimeDto;
}

export class MetricsPipelinePerformanceDto {
    @ApiProperty()
    pipeline: string;

    @ApiProperty()
    stage: string;

    @ApiProperty()
    avgDurationMs: number;

    @ApiProperty()
    count: number;
}

export class MetricsPipelinePerformanceResponseDto extends MetricsApiResponseBaseDto {
    @ApiProperty({ type: MetricsPipelinePerformanceDto, isArray: true })
    data: MetricsPipelinePerformanceDto[];
}

export class MetricsSummaryDto {
    @ApiProperty({ type: MetricsErrorRateDto, isArray: true })
    errorRate: MetricsErrorRateDto[];

    @ApiProperty()
    reviewsProcessed: number;

    @ApiProperty()
    reviewsFailed: number;

    @ApiProperty()
    avgReviewDurationMs: number;

    @ApiProperty()
    timestamp: string;
}

export class MetricsSummaryResponseDto extends MetricsApiResponseBaseDto {
    @ApiProperty({ type: MetricsSummaryDto })
    data: MetricsSummaryDto;
}
