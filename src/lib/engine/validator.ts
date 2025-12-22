/**
 * Code Validator for AI-Generated JavaScript
 * Validates syntax, structure, and security before execution
 */

import { createHelpers } from "./helpers";

export interface ValidationResult {
    valid: boolean;
    error?: string;
    warnings?: string[];
}

/**
 * Forbidden patterns that could be security risks
 */
const FORBIDDEN_PATTERNS = [
    { pattern: /\beval\s*\(/, message: "eval() is not allowed" },
    { pattern: /\bFunction\s*\(/, message: "Function constructor is not allowed" },
    { pattern: /\brequire\s*\(/, message: "require() is not allowed" },
    { pattern: /\bimport\s*\(/, message: "Dynamic import is not allowed" },
    { pattern: /\bprocess\./, message: "process access is not allowed" },
    { pattern: /\b__dirname\b/, message: "__dirname is not allowed" },
    { pattern: /\b__filename\b/, message: "__filename is not allowed" },
    { pattern: /\bglobal\b/, message: "global access is not allowed" },
    { pattern: /\bwindow\b/, message: "window access is not allowed" },
    { pattern: /\bdocument\b/, message: "document access is not allowed" },
];

/**
 * Required patterns for valid app code
 */
const REQUIRED_PATTERNS = [
    { pattern: /async\s+function\s+run\s*\(/, message: "Code must define 'async function run(inputs, helpers)'" },
    { pattern: /return\s+/, message: "Function must return a result object" },
];

/**
 * Validate AI-generated JavaScript code
 */
export function validateAppCode(code: string): ValidationResult {
    const warnings: string[] = [];

    // 1. Basic validation
    if (!code || typeof code !== "string") {
        return { valid: false, error: "Code is empty or not a string" };
    }

    const trimmedCode = code.trim();
    if (trimmedCode.length < 20) {
        return { valid: false, error: "Code is too short to be valid" };
    }

    // 2. Security check - forbidden patterns
    for (const { pattern, message } of FORBIDDEN_PATTERNS) {
        if (pattern.test(trimmedCode)) {
            return { valid: false, error: `Security violation: ${message}` };
        }
    }

    // 3. Required structure check
    for (const { pattern, message } of REQUIRED_PATTERNS) {
        if (!pattern.test(trimmedCode)) {
            return { valid: false, error: message };
        }
    }

    // 4. Syntax validation - try to parse without execution
    try {
        // We wrap the code properly to test if it's valid JavaScript
        const testWrapper = `
            ${trimmedCode}
            run({}, {});
        `;
        // Use Function constructor to check syntax (doesn't execute)
        new Function(testWrapper);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown syntax error";
        return { valid: false, error: `Syntax error: ${errorMessage}` };
    }

    // 5. Check for common issues that might cause runtime problems
    if (!trimmedCode.includes("inputs")) {
        warnings.push("Code doesn't seem to use 'inputs' parameter");
    }

    if (!trimmedCode.includes("helpers")) {
        warnings.push("Code doesn't seem to use 'helpers' parameter");
    }

    // 6. Check for unbalanced braces/brackets
    const openBraces = (trimmedCode.match(/{/g) || []).length;
    const closeBraces = (trimmedCode.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
        return { valid: false, error: "Unbalanced curly braces {}" };
    }

    const openBrackets = (trimmedCode.match(/\[/g) || []).length;
    const closeBrackets = (trimmedCode.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
        return { valid: false, error: "Unbalanced square brackets []" };
    }

    const openParens = (trimmedCode.match(/\(/g) || []).length;
    const closeParens = (trimmedCode.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
        return { valid: false, error: "Unbalanced parentheses ()" };
    }

    return {
        valid: true,
        warnings: warnings.length > 0 ? warnings : undefined,
    };
}

/**
 * Dry run code with mock helpers to check for runtime errors
 * This is a more thorough validation that actually executes the code
 */
export async function dryRunCode(code: string): Promise<ValidationResult> {
    // First do static validation
    const staticResult = validateAppCode(code);
    if (!staticResult.valid) {
        return staticResult;
    }

    try {
        // Create mock inputs (empty object simulating no user input)
        const mockInputs: Record<string, unknown> = {};

        // Create mock helpers that don't actually do anything
        const mockHelpers = {
            ai: async () => "Mock AI response",
            db: {
                store: async () => true,
                query: async () => [],
                getAll: async () => [],
                delete: async () => true,
            },
            fetch: async () => ({}),
            utils: {
                formatDate: (date: Date) => date?.toLocaleDateString?.() || "",
                formatCurrency: (amount: number) => `$${(amount || 0).toFixed(2)}`,
                generateId: () => "mock-id-12345",
            },
        };

        // Create and execute the function with mocks
        const wrappedCode = `
            ${code}
            return run(inputs, helpers);
        `;

        const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
        const testFunction = new AsyncFunction("inputs", "helpers", wrappedCode);

        // Execute with timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Dry run timed out")), 5000);
        });

        const result = await Promise.race([
            testFunction(mockInputs, mockHelpers),
            timeoutPromise,
        ]);

        // Check that result is an object
        if (result === null || typeof result !== "object") {
            return { valid: false, error: "Function must return an object" };
        }

        return { valid: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown runtime error";
        return { valid: false, error: `Runtime error: ${errorMessage}` };
    }
}

/**
 * Full validation pipeline - static + dry run
 */
export async function validateAppCodeFull(code: string): Promise<ValidationResult> {
    // Static validation first (fast)
    const staticResult = validateAppCode(code);
    if (!staticResult.valid) {
        return staticResult;
    }

    // Then dry run (slower but more thorough)
    const dryRunResult = await dryRunCode(code);
    if (!dryRunResult.valid) {
        return dryRunResult;
    }

    return {
        valid: true,
        warnings: staticResult.warnings,
    };
}

/**
 * Attempt to fix common code issues
 */
export function attemptCodeFix(code: string, error: string): string | null {
    let fixedCode = code;

    // Fix: Missing async keyword
    if (error.includes("await") && !code.includes("async function run")) {
        fixedCode = fixedCode.replace(/function\s+run\s*\(/, "async function run(");
    }

    // Fix: Missing return statement
    if (error.includes("return") && !code.includes("return")) {
        // Try to add return before the last closing brace
        const lastBraceIndex = fixedCode.lastIndexOf("}");
        if (lastBraceIndex > 0) {
            fixedCode = fixedCode.slice(0, lastBraceIndex) + "return {};\n" + fixedCode.slice(lastBraceIndex);
        }
    }

    // If we made any changes, return the fixed code
    if (fixedCode !== code) {
        return fixedCode;
    }

    return null;
}
