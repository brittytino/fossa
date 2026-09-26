import { OrganizationAndTeamData } from '@libs/core/infrastructure/config/types/general/organizationAndTeamData';
import type { NormalizedModel } from '@libs/llm/byok-config';
import { LLM } from '@libs/llm/llm';
import {
    prompt_replyAddressedToFossy_system,
    prompt_replyAddressedToFossy_user,
    replyAddressedToFossySchema,
    ReplyThreadMessage,
} from '@libs/common/utils/prompts/replyAddressedToFossy';

/**
 * A reply without @fossy in a thread Fossy started (#1946). The code gate below
 * runs first and costs nothing; the classifier is one `LLM.run` call on the
 * org's conversation model and runs only when the gate passes.
 */

/**
 * Consecutive Fossy replies to bots, with no human in between, after which Fossy
 * stops answering unmentioned bot replies in that thread. Two agents that both
 * answer whoever talks to them would otherwise loop on the org's tokens.
 */
export const IMPLICIT_REPLY_BOT_CAP = 5;

/**
 * Fossy answers in one thread after which unmentioned replies need @fossy,
 * whoever wrote them. Bot detection is partial outside GitHub (Azure exposes
 * no author type), so this bounds a loop with an agent that looks human.
 */
export const IMPLICIT_REPLY_THREAD_CAP = 10;

/** Why an unmentioned reply got no answer. Logged on every silent exit. */
export type ImplicitReplySilence =
    | 'not_fossy_thread'
    | 'fossy_author'
    | 'bot_cap'
    | 'thread_cap'
    | 'plan_blocked'
    | 'classified_no'
    | 'classifier_error';

export interface ThreadMessage extends ReplyThreadMessage {
    id: string | number;
}

const BOT_LOGIN_PATTERN = /\[bot\]$|(^|[_-])bot([_-]|$)/i;

/**
 * Bot detection from what the platform exposes: GitHub's user type, GitLab's
 * `bot` flag, and the `[bot]` / `*_bot_*` login conventions the platforms use
 * for apps and access-token users.
 */
export function isBotAuthor(author: {
    login?: string;
    type?: string;
    bot?: boolean;
}): boolean {
    if (author?.bot === true) return true;
    const type = author?.type?.toLowerCase();
    if (type === 'bot' || type === 'app_user') return true;
    return !!author?.login && BOT_LOGIN_PATTERN.test(author.login);
}

/**
 * The free part of the decision. `thread` is oldest first and ends with the
 * reply being routed. Returns why Fossy stays quiet, or undefined to go on.
 */
export function implicitReplyGate(
    thread: ThreadMessage[] | undefined,
): ImplicitReplySilence | undefined {
    if (!thread || thread.length < 2 || !thread[0].isFossy) {
        return 'not_fossy_thread';
    }

    const reply = thread[thread.length - 1];

    if (reply.isFossy) {
        return 'fossy_author';
    }

    if (
        reply.isBot &&
        fossyRepliesSinceLastHuman(thread) >= IMPLICIT_REPLY_BOT_CAP
    ) {
        return 'bot_cap';
    }

    const fossyReplies = thread.slice(1).filter((m) => m.isFossy).length;
    if (fossyReplies >= IMPLICIT_REPLY_THREAD_CAP) {
        return 'thread_cap';
    }

    return undefined;
}

/** Fossy replies after the last human message, not counting the root. */
function fossyRepliesSinceLastHuman(thread: ThreadMessage[]): number {
    const replies = thread.slice(1, -1);
    let count = 0;

    for (let i = replies.length - 1; i >= 0; i--) {
        const message = replies[i];
        if (!message.isFossy && !message.isBot) break;
        if (message.isFossy) count++;
    }

    return count;
}

/**
 * Asks the org's conversation model whether the newest message is directed at
 * Fossy. Throws on any model failure; the caller treats that as silence.
 */
export async function classifyReplyAddressedToFossy(params: {
    thread: ThreadMessage[];
    byokConfig?: NormalizedModel;
    organizationAndTeamData: OrganizationAndTeamData;
    prNumber?: number;
    platformType?: string;
}): Promise<boolean> {
    const result = await LLM.run({
        schema: replyAddressedToFossySchema,
        system: prompt_replyAddressedToFossy_system(),
        user: prompt_replyAddressedToFossy_user(params.thread),
        runName: 'ChatWithFossyFromGitUseCase::classifyImplicitReply',
        organizationId: params.organizationAndTeamData?.organizationId,
        attrs: {
            prNumber: params.prNumber,
            teamId: params.organizationAndTeamData?.teamId,
            platformType: params.platformType,
        },
        byokConfig: params.byokConfig,
    });

    if (typeof result?.addressedToFossy !== 'boolean') {
        throw new Error('Reply classifier returned no verdict');
    }

    return result.addressedToFossy;
}
