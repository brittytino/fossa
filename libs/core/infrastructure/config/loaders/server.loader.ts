import { registerAs } from '@nestjs/config';

import { configLoader } from '.';
import { HttpServerConfiguration } from '../types';

export const serverConfigLoader = registerAs(
    'server',
    (): HttpServerConfiguration => configLoader().server,
);
