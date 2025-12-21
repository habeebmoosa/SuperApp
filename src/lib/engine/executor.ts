/**
 * App Execution Engine
 * Executes AI-generated JavaScript code for apps
 */

import type { AppConfig } from "@/schemas/app-config";
import { executeCode } from "./sandbox";

export interface ExecutionResult {
    success: boolean;
    outputs: Record<string, unknown>;
    error?: string;
    executionTime?: number;
}

/**
 * Execute an app with the given inputs
 */
export async function executeApp(
    appConfig: AppConfig,
    inputs: Record<string, unknown>,
    appId: string,
    userId: string
): Promise<ExecutionResult> {
    // Check if app has generated code
    if (!appConfig.code) {
        return {
            success: false,
            outputs: {},
            error: "This app has no executable code. Please regenerate the app.",
        };
    }

    try {
        // Execute the code in sandbox
        const result = await executeCode(
            appConfig.code,
            inputs,
            appId,
            userId
        );

        if (!result.success) {
            return {
                success: false,
                outputs: {},
                error: result.error || "Execution failed",
                executionTime: result.executionTime,
            };
        }

        // Map the result to outputs if needed
        const outputs: Record<string, unknown> = {};

        // If appConfig has output definitions, map the result accordingly
        if (appConfig.outputs && appConfig.outputs.length > 0) {
            for (const output of appConfig.outputs) {
                const source = output.source;

                // Handle template variables like {{variableName}}
                if (source.startsWith("{{") && source.endsWith("}}")) {
                    const varName = source.slice(2, -2).trim();
                    outputs[output.id] = result.result[varName];
                } else if (source.includes("{{")) {
                    // Handle mixed templates like "Total: {{totalExpenses}}"
                    let value = source;
                    const matches = source.match(/\{\{([^}]+)\}\}/g);
                    if (matches) {
                        for (const match of matches) {
                            const varName = match.slice(2, -2).trim();
                            const varValue = result.result[varName];
                            value = value.replace(
                                match,
                                typeof varValue === "object"
                                    ? JSON.stringify(varValue)
                                    : String(varValue ?? "")
                            );
                        }
                    }
                    outputs[output.id] = value;
                } else {
                    // Static source
                    outputs[output.id] = source;
                }
            }
        } else {
            // No output definitions, return raw result
            Object.assign(outputs, result.result);
        }

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
        };
    }
}
