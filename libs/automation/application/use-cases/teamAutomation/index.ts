import { ActiveCodeManagementTeamAutomationsUseCase } from './active-code-manegement-automations.use-case';
import { ActiveCodeReviewAutomationUseCase } from './active-code-review-automation.use-case';
import { ActiveTeamAutomationsUseCase } from './activeTeamAutomationsUseCase';
import { UpdateOrCreateTeamAutomationUseCase } from './updateOrCreateTeamAutomationUseCase';
import { UpdateTeamAutomationStatusUseCase } from './updateTeamAutomationStatusUseCase';

export const UseCases = [
    UpdateOrCreateTeamAutomationUseCase,
    UpdateTeamAutomationStatusUseCase,
    ActiveTeamAutomationsUseCase,
    ActiveCodeManagementTeamAutomationsUseCase,
    ActiveCodeReviewAutomationUseCase,
];
