import { AuthMode } from '@libs/platform/domain/platformIntegrations/enums/codeManagement/authMode.enum';

export type ForgejoAuthDetail = {
    accessToken: string;
    authMode?: AuthMode;
    host: string;
};
