import * as React from 'react';
import { Button, Heading, Section, Text } from 'react-email';

import { EMAIL_FROM } from '../from';
import {
    BrandLayout,
    baseButton,
    baseHeading,
    baseText,
    mutedText,
} from './_layout';

export type CreditsEmailKind = 'purchased' | 'low' | 'exhausted';

export type CreditsEmailProps = {
    kind: CreditsEmailKind;
    /** "$42.50" */
    balanceLabel: string;
    /** purchased: the amount added. */
    amountLabel?: string;
    /** low: the threshold crossed. */
    thresholdLabel?: string;
    topUpUrl?: string;
};

const SUBJECT: Record<CreditsEmailKind, string> = {
    purchased: 'Fossa credits added to your organization',
    low: 'Your Fossa credits are running low',
    exhausted: 'Your Fossa credits are used up — reviews paused',
};

export const creditsEmailMeta = (kind: CreditsEmailKind) => ({
    from: EMAIL_FROM.NOTIFICATIONS,
    subject: SUBJECT[kind],
});

/**
 * One template, three moments of the prepaid-credit lifecycle ("Fossa as the
 * provider"): a top-up landed, the balance dipped under the threshold, the
 * balance hit zero. Same layout so the customer recognises the thread.
 */
function CreditsEmail({
    kind,
    balanceLabel,
    amountLabel,
    thresholdLabel,
    topUpUrl,
}: CreditsEmailProps) {
    const preview =
        kind === 'purchased'
            ? `${amountLabel ?? ''} of Fossa credits added. Balance: ${balanceLabel}.`
            : kind === 'low'
              ? `Fossa credit balance is ${balanceLabel}, below ${thresholdLabel ?? 'the threshold'}.`
              : `Fossa credit balance is ${balanceLabel}. Reviews on Fossa-routed models are paused.`;

    return (
        <BrandLayout preview={preview}>
            <Heading style={baseHeading}>
                {kind === 'purchased'
                    ? 'Credits added'
                    : kind === 'low'
                      ? 'Credits running low'
                      : 'Credits used up'}
            </Heading>

            {kind === 'purchased' ? (
                <Text style={baseText}>
                    <strong>{amountLabel}</strong> of Fossa credits were added
                    to your organization. Your balance is now{' '}
                    <strong>{balanceLabel}</strong>.
                </Text>
            ) : kind === 'low' ? (
                <Text style={baseText}>
                    Your prepaid Fossa credit balance is{' '}
                    <strong>{balanceLabel}</strong>, below your{' '}
                    <strong>{thresholdLabel}</strong> threshold. Reviews keep
                    running until the balance reaches zero.
                </Text>
            ) : (
                <Text style={baseText}>
                    Your prepaid Fossa credit balance is{' '}
                    <strong>{balanceLabel}</strong>. Code reviews on models
                    routed by Fossa are <strong>paused</strong> until you top
                    up — or connect your own AI provider key to review on
                    your account instead.
                </Text>
            )}

            {kind !== 'purchased' && topUpUrl ? (
                <Section style={{ margin: '24px 0' }}>
                    <Button href={topUpUrl} style={baseButton}>
                        Top up credits
                    </Button>
                </Section>
            ) : null}

            <Text style={mutedText}>
                Credits are debited at the model provider's list price for the
                tokens each review uses. See the full ledger in Settings →
                Subscription.
            </Text>
        </BrandLayout>
    );
}

CreditsEmail.PreviewProps = {
    kind: 'low',
    balanceLabel: '$4.20',
    thresholdLabel: '$5.00',
    topUpUrl: 'https://app.fossa.local/byok#fossa',
} satisfies CreditsEmailProps;

export default CreditsEmail;
