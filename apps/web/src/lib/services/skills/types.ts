export type SkillRequiredMcp = {
    /** e.g. "task-management" */
    category: string;
    /** e.g. "Task Management" */
    label: string;
    /** e.g. "Jira, Linear, Notion" */
    examples?: string;
};

export type SkillMeta = {
    name?: string;
    description?: string;
    version?: string;
    allowedTools?: string[];
    requiredMcps?: SkillRequiredMcp[];
};

export type SkillInstructions = {
    instructions: string;
};
