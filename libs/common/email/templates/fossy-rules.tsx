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

export type FossyRulesEmailProps = {
    userName: string;
    organizationName: string;
    rules: string[];
    rulesCount: number;
    rulesLink: string;
};

export function fossyRulesEmailMeta({
    organizationName,
}: {
    organizationName: string;
}) {
    return {
        from: EMAIL_FROM.NOTIFICATIONS,
        subject: `New Fossy Rules generated for ${organizationName}`,
    };
}

const ruleItem: React.CSSProperties = {
    backgroundColor: '#F9FAFB',
    borderLeft: '3px solid #f8b76d',
    borderRadius: 4,
    color: '#1F2937',
    fontSize: 14,
    lineHeight: '20px',
    margin: '0 0 8px',
    padding: '12px 14px',
};

function FossyRulesEmail({
    userName,
    organizationName,
    rules,
    rulesCount,
    rulesLink,
}: FossyRulesEmailProps) {
    const visibleRules = rules.slice(0, 3);
    const remaining = Math.max(rulesCount - visibleRules.length, 0);

    return (
        <BrandLayout
            preview={`${rulesCount} new Fossy Rule${
                rulesCount === 1 ? '' : 's'
            } for ${organizationName}`}
        >
            <Heading style={baseHeading}>New Fossy Rules are ready</Heading>
            <Text style={baseText}>Hi {userName},</Text>
            <Text style={baseText}>
                We just generated{' '}
                <strong>
                    {rulesCount} new rule{rulesCount === 1 ? '' : 's'}
                </strong>{' '}
                for <strong>{organizationName}</strong> based on recent code
                review activity.
            </Text>
            <Section style={{ margin: '16px 0' }}>
                {visibleRules.map((rule, index) => (
                    <Text key={index} style={ruleItem}>
                        {rule}
                    </Text>
                ))}
            </Section>
            {remaining > 0 ? (
                <Text style={mutedText}>
                    + {remaining} more — review the full list in Fossa.
                </Text>
            ) : null}
            <Section style={{ margin: '24px 0 0' }}>
                <Button href={rulesLink} style={baseButton}>
                    View Fossy Rules
                </Button>
            </Section>
        </BrandLayout>
    );
}

FossyRulesEmail.PreviewProps = {
    userName: 'Sam',
    organizationName: 'Acme Inc',
    rules: [
        'All public methods must have unit tests covering happy path and edge cases.',
        'API endpoints must include OpenAPI/Swagger documentation with request/response examples.',
        'Avoid logging PII (emails, names, tokens) in info/debug levels.',
        'Wrap async operations in try/catch and surface meaningful error messages.',
    ],
    rulesCount: 4,
    rulesLink: 'https://app.fossa.local/library/fossy-rules',
} satisfies FossyRulesEmailProps;

export default FossyRulesEmail;
