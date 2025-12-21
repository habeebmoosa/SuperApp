/**
 * App Execution Engine
 * Interprets and executes AppConfig logic blocks
 */

import { executeAIBlock } from "@/lib/ai/gemini";
import type { AppConfig, LogicBlock } from "@/schemas/app-config";
import { prisma } from "@/lib/db/prisma";

// Execution context holds all variables during app run
interface ExecutionContext {
    inputs: Record<string, unknown>;
    variables: Record<string, unknown>;
    outputs: Record<string, unknown>;
    appId: string;
    userId: string;
}

// Helper to interpolate {{variable}} templates
function interpolateTemplate(template: string, context: ExecutionContext): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const parts = path.trim().split(".");
        let value: unknown = context;

        for (const part of parts) {
            if (value && typeof value === "object" && part in value) {
                value = (value as Record<string, unknown>)[part];
            } else {
                return `{{${path}}}`; // Return original if not found
            }
        }

        return typeof value === "string" ? value : JSON.stringify(value);
    });
}

// Execute a single logic block
async function executeBlock(
    block: LogicBlock,
    context: ExecutionContext
): Promise<void> {
    switch (block.type) {
        case "ai_process": {
            const userPrompt = interpolateTemplate(block.userPromptTemplate, context);
            const result = await executeAIBlock(
                block.systemPrompt,
                userPrompt,
                block.outputFormat || "text"
            );
            context.variables[block.outputVariable] = result;
            break;
        }

        case "variable": {
            const value =
                typeof block.value === "string"
                    ? interpolateTemplate(block.value, context)
                    : block.value;
            context.variables[block.name] = value;
            break;
        }

        case "transform": {
            const inputValue = context.variables[block.input];
            let result: unknown;

            switch (block.operation) {
                case "format":
                    result = interpolateTemplate(block.expression || "", context);
                    break;
                case "parse":
                    try {
                        result = JSON.parse(inputValue as string);
                    } catch {
                        result = inputValue;
                    }
                    break;
                case "join":
                    if (Array.isArray(inputValue)) {
                        result = inputValue.join(block.expression || ", ");
                    } else {
                        result = inputValue;
                    }
                    break;
                case "split":
                    if (typeof inputValue === "string") {
                        result = inputValue.split(block.expression || ",");
                    } else {
                        result = inputValue;
                    }
                    break;
                default:
                    result = inputValue;
            }

            context.variables[block.outputVariable] = result;
            break;
        }

        case "data_store": {
            // Build record from key-value pairs
            const record: Record<string, unknown> = {};
            for (const field of block.recordFields) {
                record[field.key] = interpolateTemplate(field.value, context);
            }

            // Store in AppData
            await prisma.appData.create({
                data: {
                    appId: context.appId,
                    userId: context.userId,
                    dataType: block.dataType,
                    data: record as object,
                },
            });

            context.variables[`${block.id}_stored`] = true;
            break;
        }

        case "data_query": {
            // Build filter conditions
            const where: Record<string, unknown> = {
                appId: context.appId,
                dataType: block.dataType,
            };

            // Fetch data
            const data = await prisma.appData.findMany({
                where,
                orderBy: block.orderBy ? { createdAt: "desc" } : undefined,
                take: block.limit || 100,
            });

            context.variables[block.outputVariable] = data.map((d) => d.data);
            break;
        }

        case "conditional": {
            // Simple expression evaluation
            const conditionStr = interpolateTemplate(block.condition, context);
            // eslint-disable-next-line no-eval
            const result = eval(conditionStr);

            if (result) {
                // Execute then blocks - would need recursive execution
                context.variables[`${block.id}_result`] = "then";
            } else {
                context.variables[`${block.id}_result`] = "else";
            }
            break;
        }

        case "loop": {
            const items = context.variables[block.items];
            if (Array.isArray(items)) {
                const results: unknown[] = [];
                for (const item of items) {
                    context.variables[block.itemVariable] = item;
                    results.push(item); // Would need to execute nested blocks
                }
                context.variables[block.outputVariable] = results;
            }
            break;
        }

        case "api_call": {
            // Build URL with query params
            let url = interpolateTemplate(block.endpoint, context);
            if (block.queryParams && block.queryParams.length > 0) {
                const params = new URLSearchParams();
                for (const param of block.queryParams) {
                    params.append(param.key, interpolateTemplate(param.value, context));
                }
                url += `?${params.toString()}`;
            }

            // Build headers
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (block.headers) {
                for (const header of block.headers) {
                    headers[header.key] = interpolateTemplate(header.value, context);
                }
            }

            // Make API call
            const response = await fetch(url, {
                method: block.method,
                headers,
                body:
                    block.bodyTemplate && block.method !== "GET"
                        ? interpolateTemplate(block.bodyTemplate, context)
                        : undefined,
            });

            const data = await response.json();
            context.variables[block.outputVariable] = data;
            break;
        }
    }
}

// Main execution function
export async function executeApp(
    appConfig: AppConfig,
    inputs: Record<string, unknown>,
    appId: string,
    userId: string
): Promise<{
    success: boolean;
    outputs: Record<string, unknown>;
    error?: string;
}> {
    const context: ExecutionContext = {
        inputs,
        variables: {},
        outputs: {},
        appId,
        userId,
    };

    try {
        // Execute all logic blocks in order
        for (const block of appConfig.logic) {
            await executeBlock(block, context);
        }

        // Build outputs from output config
        for (const output of appConfig.outputs) {
            const source = output.source;
            let value: unknown;

            if (source.startsWith("{{") && source.endsWith("}}")) {
                const path = source.slice(2, -2).trim();
                const parts = path.split(".");
                value = context;

                for (const part of parts) {
                    if (value && typeof value === "object" && part in value) {
                        value = (value as Record<string, unknown>)[part];
                    } else {
                        value = undefined;
                        break;
                    }
                }
            } else {
                value = interpolateTemplate(source, context);
            }

            context.outputs[output.id] = value;
        }

        return {
            success: true,
            outputs: context.outputs,
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
