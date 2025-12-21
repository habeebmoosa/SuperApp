export type { AppConfig, InputField, LogicBlock, OutputConfig, ValidationRule } from "@/schemas/app-config";
export type { UserRegister, UserLogin } from "@/schemas/user";

// App status and auth types
export type AppStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type AuthType = "NONE" | "API_KEY" | "BASIC" | "BEARER" | "OAUTH2";
export type ConnectorType = "OAUTH2" | "REST_API";
export type RunStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
