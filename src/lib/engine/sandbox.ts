/**
 * Sandbox Execution for AI-Generated Code
 * Executes JavaScript code safely with timeout, type coercion, and error handling
 */

import { createHelpers, AppHelpers } from "./helpers";
import { validateAppCode } from "./validator";
import type { InputField } from "@/schemas/app-config";

export interface ExecutionResult {
    success: boolean;
    result: Record<string, unknown>;
    error?: string;
    errorType?: "validation" | "runtime" | "timeout";
    executionTime: number;
}

/**
 * Coerce input values to their expected types based on input field definitions
 * All form inputs come as strings, but we need to convert them to appropriate types
 */
export function coerceInputs(
    rawInputs: Record<string, unknown>,
    inputDefs?: InputField[]
): Record<string, unknown> {
    if (!inputDefs || inputDefs.length === 0) {
        return rawInputs;
    }

    const coerced: Record<string, unknown> = {};

    for (const def of inputDefs) {
        const value = rawInputs[def.id];

        // Skip if no value and not required
        if (value === undefined || value === null || value === "") {
            coerced[def.id] = def.defaultValue ?? getDefaultForType(def.type);
            continue;
        }

        // Convert string value to appropriate type
        switch (def.type) {
            case "number":
            case "range":
                const num = parseFloat(String(value));
                coerced[def.id] = isNaN(num) ? 0 : num;
                break;

            case "checkbox":
                coerced[def.id] = value === true || value === "true" || value === "on";
                break;

            case "date":
            case "datetime":
            case "time":
                if (value instanceof Date) {
                    coerced[def.id] = value;
                } else if (typeof value === "string" && value.trim()) {
                    const date = new Date(value);
                    coerced[def.id] = isNaN(date.getTime()) ? null : date;
                } else {
                    coerced[def.id] = null;
                }
                break;

            case "multiselect":
                if (Array.isArray(value)) {
                    coerced[def.id] = value;
                } else if (typeof value === "string") {
                    coerced[def.id] = value.split(",").map((s) => s.trim()).filter(Boolean);
                } else {
                    coerced[def.id] = [];
                }
                break;

            case "select":
            case "radio":
            case "text":
            case "textarea":
            case "email":
            case "url":
            case "color":
            case "richtext":
            default:
                coerced[def.id] = String(value);
                break;
        }
    }

    return coerced;
}

/**
 * Get default value for a given input type
 */
function getDefaultForType(type: string): unknown {
    switch (type) {
        case "number":
        case "range":
            return 0;
        case "checkbox":
            return false;
        case "multiselect":
            return [];
        case "date":
        case "datetime":
        case "time":
            return null;
        default:
            return "";
    }
}

/**
 * Format error messages for users
 */
function formatUserFriendlyError(error: unknown): string {
    if (error instanceof Error) {
        const message = error.message;

        // Common error patterns and user-friendly translations
        if (message.includes("is not defined")) {
            const match = message.match(/(\w+) is not defined/);
            if (match) {
                return `The app tried to use "${match[1]}" which doesn't exist. Please regenerate the app.`;
            }
        }

        if (message.includes("Cannot read properties of undefined")) {
            return "The app encountered missing data. Try providing all required inputs.";
        }

        if (message.includes("Cannot read properties of null")) {
            return "The app encountered missing data. Try providing all required inputs.";
        }

        if (message.includes("timed out")) {
            return "The app took too long to respond. Please try again with simpler inputs.";
        }

        if (message.includes("helpers") && message.includes("undefined")) {
            return "The app has an internal error. Please regenerate it.";
        }

        // Return cleaned up error message
        return message
            .replace(/at\s+.*$/gm, "") // Remove stack trace lines
            .replace(/\n+/g, " ")
            .trim();
    }

    return "An unexpected error occurred. Please try again.";
}

/**
 * Execute AI-generated JavaScript code safely
 */
export async function executeCode(
    code: string,
    inputs: Record<string, unknown>,
    appId: string,
    userId: string,
    inputDefs?: InputField[]
): Promise<ExecutionResult> {
    const startTime = Date.now();

    // 1. Validate code before execution
    const validation = validateAppCode(code);
    if (!validation.valid) {
        return {
            success: false,
            result: {},
            error: validation.error || "Invalid code",
            errorType: "validation",
            executionTime: Date.now() - startTime,
        };
    }

    // 2. Coerce inputs to proper types
    const coercedInputs = coerceInputs(inputs, inputDefs);

    // 3. Create helpers
    const helpers = createHelpers(appId, userId);

    try {
        // Create a safe async function from the code
        const asyncFunction = createSafeFunction(code);

        // Execute with timeout
        const result = await executeWithTimeout(
            asyncFunction(coercedInputs, helpers),
            30000 // 30 second timeout
        );

        const executionTime = Date.now() - startTime;

        // Ensure result is an object
        const safeResult = result && typeof result === "object" ? result : { result };

        return {
            success: true,
            result: safeResult as Record<string, unknown>,
            executionTime,
        };
    } catch (error) {
        const executionTime = Date.now() - startTime;
        console.error("Code execution error:", error);

        const isTimeout = error instanceof Error && error.message.includes("timed out");

        return {
            success: false,
            result: {},
            error: formatUserFriendlyError(error),
            errorType: isTimeout ? "timeout" : "runtime",
            executionTime,
        };
    }
}

/**
 * Create a safe async function from code string
 */
function createSafeFunction(
    code: string
): (inputs: Record<string, unknown>, helpers: AppHelpers) => Promise<Record<string, unknown>> {
    try {
        const trimmedCode = code.trim();

        // Handle the case where code is the full function definition
        if (trimmedCode.includes("async function run")) {
            const wrappedCode = `
                ${trimmedCode}
                return run(inputs, helpers);
            `;

            const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
            return new AsyncFunction("inputs", "helpers", wrappedCode);
        }

        // If it's just the function body
        const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
        return new AsyncFunction("inputs", "helpers", trimmedCode);
    } catch (error) {
        console.error("Failed to create function:", error);
        throw new Error("Invalid code format - the app needs to be regenerated");
    }
}

/**
 * Execute a promise with timeout
 */
async function executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(`Execution timed out after ${timeoutMs / 1000} seconds`));
        }, timeoutMs);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId!);
        return result;
    } catch (error) {
        clearTimeout(timeoutId!);
        throw error;
    }
}
