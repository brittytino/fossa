import { IAutomationRepository } from './automation.repository';

export const AUTOMATION_SERVICE_TOKEN = Symbol.for('AutomationService');

export interface IAutomationService extends IAutomationRepository {}
