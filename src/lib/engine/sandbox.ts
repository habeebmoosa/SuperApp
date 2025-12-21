/**
 * Sandbox Execution for AI-Generated Code
 * Executes JavaScript code safely with timeout and error handling
 */

import { createHelpers, AppHelpers } from "./helpers";

interface ExecutionResult {
    success: boolean;
    result: Record<string, unknown>;
    error?: string;
    executionTime: number;
}

/**
 * Execute AI-generated JavaScript code safely
 */
export async function executeCode(
    code: string,
    inputs: Record<string, unknown>,
    appId: string,
    userId: string
): Promise<ExecutionResult> {
    const startTime = Date.now();
    const helpers = createHelpers(appId, userId);

    try {
        // Wrap the code in an async function if it isn't already
        let wrappedCode = code.trim();

        // Extract the function body from the code string
        // The AI generates: async function run(inputs, helpers) { ... }
        // We need to extract and execute this

        // Create a safe async function from the code
        const asyncFunction = createSafeFunction(wrappedCode);

        // Execute with timeout
        const result = await executeWithTimeout(
            asyncFunction(inputs, helpers),
            30000 // 30 second timeout
        );

        const executionTime = Date.now() - startTime;

        return {
            success: true,
            result: result || {},
            executionTime,
        };
    } catch (error) {
        const executionTime = Date.now() - startTime;
        console.error("Code execution error:", error);

        return {
            success: false,
            result: {},
            error: error instanceof Error ? error.message : "Execution failed",
            executionTime,
        };
    }
}

/**
 * Create a safe async function from code string
 */
function createSafeFunction(code: string): (inputs: Record<string, unknown>, helpers: AppHelpers) => Promise<Record<string, unknown>> {
    // The code should be in format: async function run(inputs, helpers) { ... }
    // We need to wrap it and return the run function

    try {
        // Handle the case where code is the full function definition
        if (code.includes("async function run")) {
            // Create a wrapper that defines and calls the function
            const wrappedCode = `
        ${code}
        return run(inputs, helpers);
      `;

            // Create the function using AsyncFunction constructor
            // This is safer than eval and allows async/await
            const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
            return new AsyncFunction("inputs", "helpers", wrappedCode);
        }

        // If it's just the function body
        const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
        return new AsyncFunction("inputs", "helpers", code);
    } catch (error) {
        console.error("Failed to create function:", error);
        throw new Error("Invalid code format");
    }
}

/**
 * Execute a promise with timeout
 */
async function executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
): Promise<T> {
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
