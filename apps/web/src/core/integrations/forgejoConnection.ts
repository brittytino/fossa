import { IIntegrationConnector } from "./IIntegrationConnector";

export class ForgejoConnection implements IIntegrationConnector {
    async connect(
        hasConnection: boolean,
        routerConfig: any,
        routerPath?: string,
    ) {
        if (hasConnection) {
            routerConfig.push(
                routerPath || `${routerConfig.pathname}/forgejo/configuration`,
            );
        } else {
            routerConfig.push(
                routerPath || `${routerConfig.pathname}?connect=forgejo`,
            );
        }
    }
}
