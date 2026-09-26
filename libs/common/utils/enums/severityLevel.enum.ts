import z from 'zod';

export enum SeverityLevel {
    CRITICAL = 'critical',
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
}

export const severityLevelSchema = z.enum([...Object.values(SeverityLevel)] as [
    SeverityLevel,
    ...SeverityLevel[],
]);
