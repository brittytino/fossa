/**
 * The `fossa` BYOK provider — "Fossa as the provider". The org picks a model
 * and Fossa routes it over its OWN upstream accounts, billing the org's Fossa
 * credits. Web mirror of `isPlatformFundedProvider` in
 * libs/llm/platform-funded-provider.ts (the web bundle cannot import a value
 * from libs/llm), so the one exception to "a credential carries a key" is
 * stated in one place on this side too.
 */
export const FOSSA_PROVIDER_ID = "fossa";

export const isPlatformFundedProvider = (provider?: string | null): boolean =>
    provider === FOSSA_PROVIDER_ID;
