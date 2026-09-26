/**
 * Event types for heavy stage completion
 * Used to identify which event indicates stage completion
 */
export enum EventType {
    AST_ANALYSIS_COMPLETED = 'ast.task.completed',
    PR_LEVEL_REVIEW_COMPLETED = 'pr.level.review.completed',
    FILES_REVIEW_COMPLETED = 'files.review.completed',
    LLM_ANALYSIS_COMPLETED = 'llm.analysis.completed',
}
