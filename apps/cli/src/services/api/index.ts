import { RealApi } from './api.real.js';

export type { IFossaApi, IRulesApi, ISessionsApi } from './api.interface.js';

export const api = new RealApi();
