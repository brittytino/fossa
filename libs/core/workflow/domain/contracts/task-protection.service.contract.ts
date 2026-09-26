export interface ITaskProtectionService {
    protectTask(expiresInMinutes: number): Promise<void>;
    unprotectTask(): Promise<void>;
}

export const TASK_PROTECTION_SERVICE_TOKEN = Symbol(
    'TASK_PROTECTION_SERVICE_TOKEN',
);
