export const EMAIL_FROM = {
    NOTIFICATIONS: {
        email: 'noreply@notifications.fossa.local',
        name: 'Fossy from Fossa',
    },
} as const;

export type EmailFrom = (typeof EMAIL_FROM)[keyof typeof EMAIL_FROM];

export function formatFromAddress(from: EmailFrom): string {
    return `${from.name} <${from.email}>`;
}
