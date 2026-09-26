import { tool } from 'ai';
import { z } from 'zod';

import {
    createWriteAuthorization,
    requireDeclaredAction,
} from './write-authorization';

const stub = () =>
    tool({
        description: 'stub',
        inputSchema: z.object({}),
        execute: async () => 'written',
    });

const isWrite = (name: string) => name === 'FOSSA_CREATE_MEMORY';

describe('requireDeclaredAction', () => {
    it('refuses a write nobody declared, and says how to proceed', async () => {
        const auth = createWriteAuthorization();
        const tools = requireDeclaredAction(
            { FOSSA_CREATE_MEMORY: stub() },
            isWrite,
            auth,
        );

        const result = await tools.FOSSA_CREATE_MEMORY.execute!(
            {},
            {} as never,
        );

        expect(String(result)).toMatch(/fossaDecideAction/);
        expect(String(result)).toMatch(/not been performed/i);
    });

    it('lets the write through once an action is authorized', async () => {
        const auth = createWriteAuthorization();
        auth.grant('FOSSA_CREATE_MEMORY');
        const tools = requireDeclaredAction(
            { FOSSA_CREATE_MEMORY: stub() },
            isWrite,
            auth,
        );

        await expect(
            tools.FOSSA_CREATE_MEMORY.execute!({}, {} as never),
        ).resolves.toBe('written');
    });

    it('authorizes the declared tool only', async () => {
        const auth = createWriteAuthorization();
        auth.grant('FOSSA_CREATE_FOSSY_ISSUE');
        const tools = requireDeclaredAction(
            { FOSSA_CREATE_MEMORY: stub() },
            isWrite,
            auth,
        );

        expect(
            String(await tools.FOSSA_CREATE_MEMORY.execute!({}, {} as never)),
        ).toMatch(/fossaDecideAction/);
    });

    it('grants every write when the declaration named no tool', async () => {
        const auth = createWriteAuthorization();
        auth.grant(undefined);
        const tools = requireDeclaredAction(
            { FOSSA_CREATE_MEMORY: stub() },
            isWrite,
            auth,
        );

        await expect(
            tools.FOSSA_CREATE_MEMORY.execute!({}, {} as never),
        ).resolves.toBe('written');
    });

    it('leaves read tools alone', async () => {
        const auth = createWriteAuthorization();
        const read = stub();
        const tools = requireDeclaredAction(
            { FOSSA_FIND_MEMORIES: read },
            isWrite,
            auth,
        );

        expect(tools.FOSSA_FIND_MEMORIES).toBe(read);
    });
});
