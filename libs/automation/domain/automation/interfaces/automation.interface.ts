import { AutomationLevel } from '@libs/core/domain/enums';

import { AutomationType } from '../enum/automation-type';

export interface IAutomation {
    uuid: string;
    name: string;
    description: string;
    tags: string[];
    antiPatterns: string[];
    status: boolean;
    automationType: AutomationType;
    level: AutomationLevel;
}
