import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    IsArray,
    IsDateString,
    IsDefined,
    IsIn,
    IsOptional,
    IsString,
    MaxLength,
    ValidateIf,
    ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const CLI_SESSION_CAPTURE_AGENTS = [
    'claude-code',
    'cursor',
    'codex',
] as const;

class CliSessionCaptureToolUseDto {
    @IsString()
    @MaxLength(120)
    @ApiProperty({ example: 'Write' })
    tool: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    @ApiPropertyOptional({ example: 'src/auth/jwt.ts' })
    filePath?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    @ApiPropertyOptional({ example: 'Created JWT helper' })
    summary?: string;
}

class CliSessionCaptureSignalsDto {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    @ApiPropertyOptional({ example: 'sess-abc123' })
    sessionId?: string;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    @ApiPropertyOptional({ example: 'turn-456' })
    turnId?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20000)
    @ApiPropertyOptional({ example: 'Refactor auth to use JWT' })
    prompt?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10000)
    @ApiPropertyOptional({
        example: 'I decided to use JWT because it allows stateless auth...',
    })
    assistantMessage?: string;

    @IsArray()
    @ArrayMaxSize(500)
    @IsString({ each: true })
    @MaxLength(500, { each: true })
    @ApiProperty({
        type: String,
        isArray: true,
        example: ['src/auth/jwt.ts', 'src/auth/middleware.ts'],
    })
    modifiedFiles: string[];

    @IsArray()
    @ArrayMaxSize(500)
    @ValidateNested({ each: true })
    @Type(() => CliSessionCaptureToolUseDto)
    @ApiProperty({
        type: CliSessionCaptureToolUseDto,
        isArray: true,
        example: [
            {
                tool: 'Write',
                filePath: 'src/auth/jwt.ts',
                summary: 'Created JWT helper',
            },
        ],
    })
    toolUses: CliSessionCaptureToolUseDto[];
}

export class CliSessionCaptureRequestDto {
    @IsString()
    @MaxLength(250)
    @ApiProperty({ example: 'feat/auth' })
    branch: string;

    @IsDefined()
    @ValidateIf((_, value) => value !== null)
    @IsString()
    @MaxLength(40)
    @ApiProperty({ example: 'a1b2c3d4e5f6', nullable: true })
    sha: string | null;

    @IsDefined()
    @ValidateIf((_, value) => value !== null)
    @IsString()
    @MaxLength(200)
    @ApiProperty({ example: 'brittytino/cli', nullable: true })
    orgRepo: string | null;

    @IsIn(CLI_SESSION_CAPTURE_AGENTS)
    @ApiProperty({
        enum: CLI_SESSION_CAPTURE_AGENTS,
        example: 'claude-code',
    })
    agent: (typeof CLI_SESSION_CAPTURE_AGENTS)[number];

    @IsIn(['stop'])
    @ApiProperty({ example: 'stop', enum: ['stop'] })
    event: 'stop';

    @IsDefined()
    @ValidateNested()
    @Type(() => CliSessionCaptureSignalsDto)
    @ApiProperty({ type: CliSessionCaptureSignalsDto })
    signals: CliSessionCaptureSignalsDto;

    @IsOptional()
    @IsString()
    @MaxLength(5000)
    @ApiPropertyOptional({ example: 'Refactored auth module' })
    summary?: string;

    @IsDateString()
    @ApiProperty({ example: '2025-06-01T10:30:00.000Z' })
    capturedAt: string;
}
