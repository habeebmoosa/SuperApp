/**
 * App Execution Engine
 * Executes AI-generated JavaScript code for apps with type coercion and better error handling
 */

import type { AppConfig, InputField } from "@/schemas/app-config";
import { executeCode } from "./sandbox";

export interface ExecutionResult {
    success: boolean;
    outputs: Record<string, unknown>;
    error?: string;
    errorType?: "validation" | "runtime" | "timeout" | "no-code";
    executionTime?: number;
}

/**
 * Execute an app with the given inputs
 * 
 * @param appConfig - The app configuration (UI parts)
 * @param inputs - User-provided input values
 * @param appId - ID of the app (for data storage)
 * @param userId - ID of the user running the app
 * @param appCode - Optional separate code field (preferred over appConfig.code)
 */
export async function executeApp(
    appConfig: AppConfig,
    inputs: Record<string, unknown>,
    appId: string,
    userId: string,
    appCode?: string | null
): Promise<ExecutionResult> {
    // Determine which code to use (prefer separate appCode field)
    const code = appCode || appConfig.code;

    // Check if app has code
    if (!code) {
        return {
            success: false,
            outputs: {},
            error: "This app has no executable code. Please regenerate the app.",
            errorType: "no-code",
        };
    }

    try {
        // Execute the code in sandbox with type coercion
        const result = await executeCode(
            code,
            inputs,
            appId,
            userId,
            appConfig.inputs as InputField[]
        );

        if (!result.success) {
            return {
                success: false,
                outputs: {},
                error: result.error || "Execution failed",
                errorType: result.errorType,
                executionTime: result.executionTime,
            };
        }

        // Map the result to outputs based on output definitions
        const outputs = mapResultToOutputs(result.result, appConfig.outputs || []);

        return {
            success: true,
            outputs,
            executionTime: result.executionTime,
        };
    } catch (error) {
        console.error("App execution error:", error);
        return {
            success: false,
            outputs: {},
            error: error instanceof Error ? error.message : "Execution failed",
            errorType: "runtime",
        };
    }
}

/**
 * Map raw execution result to output definitions
 */
function mapResultToOutputs(
    result: Record<string, unknown>,
    outputDefs: Array<{ id: string; source: string; type?: string; label?: string }>
): Record<string, unknown> {
    const outputs: Record<string, unknown> = {};

    // If no output definitions, return raw result
    if (!outputDefs || outputDefs.length === 0) {
        return { ...result };
    }

    for (const output of outputDefs) {
        const source = output.source;

        // Handle pure template variables like {{variableName}}
        if (source.startsWith("{{") && source.endsWith("}}")) {
            const varName = source.slice(2, -2).trim();
            outputs[output.id] = result[varName];
        }
        // Handle mixed templates like "Total: {{totalExpenses}} items"
        else if (source.includes("{{")) {
            let value = source;
            const matches = source.match(/\{\{([^}]+)\}\}/g);

            if (matches) {
                for (const match of matches) {
                    const varName = match.slice(2, -2).trim();
                    const varValue = result[varName];

                    // Format the value appropriately
                    let formatted: string;
                    if (varValue === undefined || varValue === null) {
                        formatted = "";
                    } else if (Array.isArray(varValue)) {
                        // For arrays in template strings, just show count
                        formatted = `${varValue.length} items`;
                    } else if (typeof varValue === "object") {
                        formatted = JSON.stringify(varValue);
                    } else {
                        formatted = String(varValue);
                    }

                    value = value.replace(match, formatted);
                }
            }
            outputs[output.id] = value;
        }
        // Static source (no template)
        else {
            outputs[output.id] = source;
        }
    }

    return outputs;
}

/**
 * Validate that all required outputs are present in result
 */
export function validateOutputs(
    result: Record<string, unknown>,
    outputDefs: Array<{ id: string; source: string }>
): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    for (const output of outputDefs) {
        const source = output.source;

        // Extract variable names from source
        const matches = source.match(/\{\{([^}]+)\}\}/g);
        if (matches) {
            for (const match of matches) {
                const varName = match.slice(2, -2).trim();
                if (!(varName in result)) {
                    missing.push(varName);
                }
            }
        }
    }

    return {
        valid: missing.length === 0,
        missing,
    };
}
