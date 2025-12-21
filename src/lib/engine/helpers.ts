/**
 * Helper Functions for Sandboxed App Execution
 * These are safe wrappers that apps can use
 */

import { executeAIBlock } from "@/lib/ai/gemini";
import { prisma } from "@/lib/db/prisma";

export interface AppHelpers {
    ai: (prompt: string, systemPrompt?: string) => Promise<string>;
    db: {
        store: (dataType: string, data: Record<string, unknown>) => Promise<boolean>;
        query: (dataType: string, limit?: number) => Promise<Record<string, unknown>[]>;
        getAll: (dataType: string) => Promise<Record<string, unknown>[]>;
        delete: (dataType: string, id: string) => Promise<boolean>;
    };
    fetch: (url: string, options?: RequestInit) => Promise<unknown>;
    utils: {
        formatDate: (date: Date) => string;
        formatCurrency: (amount: number) => string;
        generateId: () => string;
    };
}

export function createHelpers(appId: string, userId: string): AppHelpers {
    return {
        // AI helper - calls Gemini
        ai: async (prompt: string, systemPrompt?: string): Promise<string> => {
            try {
                return await executeAIBlock(systemPrompt, prompt, "text");
            } catch (error) {
                console.error("AI helper error:", error);
                throw new Error("AI processing failed");
            }
        },

        // Database helpers
        db: {
            // Store data
            store: async (dataType: string, data: Record<string, unknown>): Promise<boolean> => {
                try {
                    await prisma.appData.create({
                        data: {
                            appId,
                            userId,
                            dataType,
                            data: data as object,
                        },
                    });
                    return true;
                } catch (error) {
                    console.error("DB store error:", error);
                    throw new Error("Failed to store data");
                }
            },

            // Query data with limit
            query: async (dataType: string, limit = 100): Promise<Record<string, unknown>[]> => {
                try {
                    const results = await prisma.appData.findMany({
                        where: { appId, dataType },
                        take: limit,
                        orderBy: { createdAt: "desc" },
                    });
                    return results.map((r) => r.data as Record<string, unknown>);
                } catch (error) {
                    console.error("DB query error:", error);
                    throw new Error("Failed to query data");
                }
            },

            // Get all data for this app/dataType
            getAll: async (dataType: string): Promise<Record<string, unknown>[]> => {
                try {
                    const results = await prisma.appData.findMany({
                        where: { appId, dataType },
                        orderBy: { createdAt: "desc" },
                    });
                    return results.map((r) => r.data as Record<string, unknown>);
                } catch (error) {
                    console.error("DB getAll error:", error);
                    throw new Error("Failed to get data");
                }
            },

            // Delete data by ID
            delete: async (dataType: string, id: string): Promise<boolean> => {
                try {
                    await prisma.appData.deleteMany({
                        where: { appId, dataType, id },
                    });
                    return true;
                } catch (error) {
                    console.error("DB delete error:", error);
                    throw new Error("Failed to delete data");
                }
            },
        },

        // Safe fetch - HTTPS only, with timeout
        fetch: async (url: string, options?: RequestInit): Promise<unknown> => {
            // Security: Only allow HTTPS
            if (!url.startsWith("https://")) {
                throw new Error("Only HTTPS URLs are allowed");
            }

            // Block internal/private IPs
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;
            if (
                hostname === "localhost" ||
                hostname === "127.0.0.1" ||
                hostname.startsWith("192.168.") ||
                hostname.startsWith("10.") ||
                hostname.startsWith("172.")
            ) {
                throw new Error("Internal URLs are not allowed");
            }

            try {
                const response = await fetch(url, {
                    ...options,
                    signal: AbortSignal.timeout(10000), // 10 second timeout
                });
                return await response.json();
            } catch (error) {
                console.error("Fetch error:", error);
                throw new Error("HTTP request failed");
            }
        },

        // Utility helpers
        utils: {
            formatDate: (date: Date): string => {
                try {
                    return new Intl.DateTimeFormat("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    }).format(date);
                } catch {
                    return String(date);
                }
            },

            formatCurrency: (amount: number): string => {
                try {
                    return new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                    }).format(amount);
                } catch {
                    return `$${amount.toFixed(2)}`;
                }
            },

            generateId: (): string => {
                return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            },
        },
    };
}
