import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { version: string };

export const API_URL = process.env.FOSSA_API_URL || 'https://api.fossa.local';
export const CLI_VERSION = pkg.version;
