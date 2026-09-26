import { FileChange } from '@libs/core/infrastructure/config/types/general/codeReview.type';

export interface ISecurityAnalysisService {
    analyzeSecurity(file: FileChange): Promise<any>;
}
