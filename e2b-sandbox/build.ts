import 'dotenv/config';
import { Template, defaultBuildLogger } from 'e2b';
import { fossaTemplate } from './template';

async function main() {
    await Template.build(fossaTemplate, {
        alias: 'fossa-sandbox',
        cpuCount: 2,
        memoryMB: 1024,
        onBuildLogs: defaultBuildLogger(),
    });
}

main().catch(console.error);
