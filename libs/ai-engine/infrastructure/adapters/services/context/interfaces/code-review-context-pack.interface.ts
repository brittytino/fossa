export interface ContextAugmentationOutput {
    provider?: string;
    toolName: string;
    success: boolean;
    output?: string;
    error?: string;
}

export type ContextAugmentationsMap = Record<
    string,
    {
        path: string[];
        requirementId?: string;
        outputs: ContextAugmentationOutput[];
    }
>;
