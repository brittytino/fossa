import { CommandError } from './command-errors.js';

export const SUPPORTED_REPO_SETTINGS_SECTIONS = [
    'general',
    'review-categories',
    'custom-prompts',
    'suggestion-control',
    'pr-summary',
    'fossy-rules',
    'custom-messages',
    'business-rules',
] as const;

export type RepositorySettingsSection =
    (typeof SUPPORTED_REPO_SETTINGS_SECTIONS)[number];

const SECTION_LABELS: Record<RepositorySettingsSection, string> = {
    'general': 'General',
    'review-categories': 'Review Categories',
    'custom-prompts': 'Custom Prompts',
    'suggestion-control': 'Suggestion Control',
    'pr-summary': 'PR Summary',
    'fossy-rules': 'Fossy Rules',
    'custom-messages': 'Custom Messages',
    'business-rules': 'Business Rules',
};

export function getFossaAppUrl(): string {
    const configuredUrl = process.env.FOSSA_APP_URL?.trim();
    return configuredUrl || 'https://app.fossa.local';
}

export function validateRepositorySettingsSection(
    section: string | undefined,
): RepositorySettingsSection {
    const normalized = section?.trim().toLowerCase() || 'general';
    if (
        !SUPPORTED_REPO_SETTINGS_SECTIONS.includes(
            normalized as RepositorySettingsSection,
        )
    ) {
        throw new CommandError(
            'INVALID_INPUT',
            `Unsupported section '${section}'. Supported sections: ${SUPPORTED_REPO_SETTINGS_SECTIONS.join(', ')}`,
        );
    }

    return normalized as RepositorySettingsSection;
}

export function getRepositorySettingsSectionLabel(
    section: RepositorySettingsSection,
): string {
    return SECTION_LABELS[section];
}
