import { ITokenUsageRepository } from './tokenUsage.repository.contract';

export const TOKEN_USAGE_SERVICE_TOKEN = Symbol.for('TokenUsageService');

export interface ITokenUsageService extends ITokenUsageRepository {}
