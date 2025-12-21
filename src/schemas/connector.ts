import { z } from "zod";

export const ConnectorTemplateSchema = z.object({
    name: z.string().min(1).max(100),
    icon: z.string().optional(),
    category: z.enum(["email", "calendar", "productivity", "social", "storage", "custom"]),
    type: z.enum(["OAUTH2", "REST_API"]),
    description: z.string().optional(),
    authUrl: z.string().url().optional(),
    tokenUrl: z.string().url().optional(),
    scopes: z.array(z.string()).optional(),
    baseUrl: z.string().url().optional(),
});

export const UserConnectorSchema = z.object({
    name: z.string().min(1).max(100),
    templateId: z.string(),
    authType: z.enum(["NONE", "API_KEY", "BASIC", "BEARER", "OAUTH2"]),
    credentials: z.any().optional(),
    baseUrl: z.string().url().optional(),
    headers: z.record(z.string(), z.string()).optional(),
});

export const RESTConnectorTestSchema = z.object({
    connectorId: z.string(),
    method: z.enum(["GET", "POST", "PUT", "DELETE"]),
    endpoint: z.string(),
    body: z.any().optional(),
});

export type ConnectorTemplate = z.infer<typeof ConnectorTemplateSchema>;
export type UserConnector = z.infer<typeof UserConnectorSchema>;
