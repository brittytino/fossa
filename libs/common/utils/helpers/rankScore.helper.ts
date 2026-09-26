const categoryMapping: Record<string, string> = {
    security: 'security',
    code_style: 'code_style',
    performance_and_optimization: 'performance_and_optimization',
    documentation_and_comments: 'documentation_and_comments',
    error_handling: 'error_handling',
    potential_issues: 'potential_issues',
    maintainability: 'maintainability',
    refactoring: 'refactoring',
};

export const normalizeCategory = (category: string): string => {
    if (!category) return 'unknown';
    return categoryMapping[category.toLowerCase()] || category;
};
