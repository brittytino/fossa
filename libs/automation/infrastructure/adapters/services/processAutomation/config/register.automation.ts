import { Inject, Injectable } from '@nestjs/common';

import { IAutomationFactory } from '@libs/automation/domain/automationExecution/processAutomation/automation.factory';

@Injectable()
export class AutomationRegistry {
    private strategies: Map<string, IAutomationFactory> = new Map();

    constructor(
        @Inject('STRATEGIES_AUTOMATION')
        private readonly strategiesList: IAutomationFactory[],
    ) {
        for (const strategy of strategiesList) {
            this.register(strategy);
        }
    }

    register(strategy: IAutomationFactory) {
        this.strategies.set(strategy?.automationType, strategy);
    }

    getStrategy(name: string): IAutomationFactory {
        const strategy = this.strategies.get(name);

        if (!strategy) {
            throw new Error(`Unsupported name: ${name}`);
        }

        return strategy;
    }
}
