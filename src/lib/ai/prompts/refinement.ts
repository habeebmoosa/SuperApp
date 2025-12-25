/**
 * App Refinement Prompt
 * Used for updating existing app configurations based on user feedback
 */

export const APP_REFINEMENT_PROMPT = `You are updating an existing app configuration based on user feedback.

Current AppConfig:
{{currentConfig}}

User's request:
{{refinement}}

RULES:
1. Preserve existing functionality unless explicitly changed
2. Keep all existing IDs for unchanged elements
3. Update the "code" field if logic changes are needed
4. Output ONLY the complete updated JSON
5. No explanations, no markdown - just JSON
6. Ensure code remains on a single line`;
