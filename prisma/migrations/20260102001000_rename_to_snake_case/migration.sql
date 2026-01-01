-- Migration: Rename tables and columns from PascalCase to snake_case
-- This migration preserves all existing data by using ALTER TABLE RENAME

-- =============================================
-- STEP 1: Rename Enum Types
-- =============================================

ALTER TYPE "ConnectorType" RENAME TO "connector_type";

ALTER TYPE "AuthType" RENAME TO "auth_type";

ALTER TYPE "AppStatus" RENAME TO "app_status";

ALTER TYPE "RunStatus" RENAME TO "run_status";

ALTER TYPE "MessageRole" RENAME TO "message_role";

ALTER TYPE "LLMProvider" RENAME TO "llm_provider";

-- =============================================
-- STEP 2: Rename Tables (order matters for foreign keys)
-- =============================================

-- Rename User table
ALTER TABLE "User" RENAME TO "users";

-- Rename Account table
ALTER TABLE "Account" RENAME TO "accounts";

-- Rename App table
ALTER TABLE "App" RENAME TO "apps";

-- Rename ConnectorTemplate table
ALTER TABLE "ConnectorTemplate" RENAME TO "connector_templates";

-- Rename UserConnector table
ALTER TABLE "UserConnector" RENAME TO "user_connectors";

-- Rename AppData table
ALTER TABLE "AppData" RENAME TO "app_data";

-- Rename AppRun table
ALTER TABLE "AppRun" RENAME TO "app_runs";

-- Rename AppConversation table
ALTER TABLE "AppConversation" RENAME TO "app_conversations";

-- Rename Message table
ALTER TABLE "Message" RENAME TO "messages";

-- Rename AppVersion table
ALTER TABLE "AppVersion" RENAME TO "app_versions";

-- Rename ApiKey table
ALTER TABLE "ApiKey" RENAME TO "api_keys";

-- =============================================
-- STEP 3: Rename Columns in each table
-- =============================================

-- Users table columns
ALTER TABLE "users" RENAME COLUMN "passwordHash" TO "password_hash";

ALTER TABLE "users"
RENAME COLUMN "emailVerified" TO "email_verified";

ALTER TABLE "users" RENAME COLUMN "avatarUrl" TO "avatar_url";

ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";

ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";

-- Accounts table columns
ALTER TABLE "accounts" RENAME COLUMN "userId" TO "user_id";

ALTER TABLE "accounts"
RENAME COLUMN "providerAccountId" TO "provider_account_id";
-- Note: refresh_token, access_token, expires_at, token_type, id_token, session_state are already snake_case

-- Apps table columns
ALTER TABLE "apps"
RENAME COLUMN "currentVersion" TO "current_version";

ALTER TABLE "apps" RENAME COLUMN "appConfig" TO "app_config";

ALTER TABLE "apps" RENAME COLUMN "appCode" TO "app_code";

ALTER TABLE "apps"
RENAME COLUMN "originalPrompt" TO "original_prompt";

ALTER TABLE "apps" RENAME COLUMN "userId" TO "user_id";

ALTER TABLE "apps"
RENAME COLUMN "conversationId" TO "conversation_id";

ALTER TABLE "apps" RENAME COLUMN "createdAt" TO "created_at";

ALTER TABLE "apps" RENAME COLUMN "updatedAt" TO "updated_at";

-- Connector Templates table columns
ALTER TABLE "connector_templates"
RENAME COLUMN "authUrl" TO "auth_url";

ALTER TABLE "connector_templates"
RENAME COLUMN "tokenUrl" TO "token_url";

ALTER TABLE "connector_templates"
RENAME COLUMN "baseUrl" TO "base_url";

ALTER TABLE "connector_templates"
RENAME COLUMN "isActive" TO "is_active";

ALTER TABLE "connector_templates"
RENAME COLUMN "createdAt" TO "created_at";

-- User Connectors table columns
ALTER TABLE "user_connectors"
RENAME COLUMN "isActive" TO "is_active";

ALTER TABLE "user_connectors"
RENAME COLUMN "templateId" TO "template_id";

ALTER TABLE "user_connectors"
RENAME COLUMN "authType" TO "auth_type";

ALTER TABLE "user_connectors" RENAME COLUMN "baseUrl" TO "base_url";

ALTER TABLE "user_connectors" RENAME COLUMN "userId" TO "user_id";

ALTER TABLE "user_connectors"
RENAME COLUMN "createdAt" TO "created_at";

ALTER TABLE "user_connectors"
RENAME COLUMN "updatedAt" TO "updated_at";

-- App Data table columns
ALTER TABLE "app_data" RENAME COLUMN "appId" TO "app_id";

ALTER TABLE "app_data" RENAME COLUMN "userId" TO "user_id";

ALTER TABLE "app_data" RENAME COLUMN "dataType" TO "data_type";

ALTER TABLE "app_data" RENAME COLUMN "createdAt" TO "created_at";

ALTER TABLE "app_data" RENAME COLUMN "updatedAt" TO "updated_at";

-- App Runs table columns
ALTER TABLE "app_runs" RENAME COLUMN "appId" TO "app_id";

ALTER TABLE "app_runs" RENAME COLUMN "userId" TO "user_id";

ALTER TABLE "app_runs" RENAME COLUMN "createdAt" TO "created_at";

-- App Conversations table columns
ALTER TABLE "app_conversations" RENAME COLUMN "userId" TO "user_id";

ALTER TABLE "app_conversations"
RENAME COLUMN "createdAt" TO "created_at";

ALTER TABLE "app_conversations"
RENAME COLUMN "updatedAt" TO "updated_at";

-- Messages table columns
ALTER TABLE "messages"
RENAME COLUMN "conversationId" TO "conversation_id";

ALTER TABLE "messages" RENAME COLUMN "hasArtifact" TO "has_artifact";

ALTER TABLE "messages"
RENAME COLUMN "artifactName" TO "artifact_name";

ALTER TABLE "messages"
RENAME COLUMN "artifactIcon" TO "artifact_icon";

ALTER TABLE "messages"
RENAME COLUMN "artifactConfig" TO "artifact_config";

ALTER TABLE "messages"
RENAME COLUMN "artifactCode" TO "artifact_code";

ALTER TABLE "messages" RENAME COLUMN "createdAt" TO "created_at";

-- App Versions table columns
ALTER TABLE "app_versions" RENAME COLUMN "appId" TO "app_id";

ALTER TABLE "app_versions" RENAME COLUMN "appConfig" TO "app_config";

ALTER TABLE "app_versions" RENAME COLUMN "appCode" TO "app_code";

ALTER TABLE "app_versions" RENAME COLUMN "messageId" TO "message_id";

ALTER TABLE "app_versions" RENAME COLUMN "createdAt" TO "created_at";

-- API Keys table columns
ALTER TABLE "api_keys" RENAME COLUMN "apiKey" TO "api_key";

ALTER TABLE "api_keys" RENAME COLUMN "baseUrl" TO "base_url";

ALTER TABLE "api_keys" RENAME COLUMN "isActive" TO "is_active";

ALTER TABLE "api_keys" RENAME COLUMN "isDefault" TO "is_default";

ALTER TABLE "api_keys" RENAME COLUMN "userId" TO "user_id";

ALTER TABLE "api_keys" RENAME COLUMN "createdAt" TO "created_at";

ALTER TABLE "api_keys" RENAME COLUMN "updatedAt" TO "updated_at";

-- =============================================
-- STEP 4: Rename Indexes (drop and recreate with new names)
-- =============================================

-- Drop old indexes
DROP INDEX IF EXISTS "User_email_key";

DROP INDEX IF EXISTS "Account_provider_providerAccountId_key";

DROP INDEX IF EXISTS "Account_userId_idx";

DROP INDEX IF EXISTS "App_conversationId_key";

DROP INDEX IF EXISTS "App_userId_idx";

DROP INDEX IF EXISTS "ConnectorTemplate_name_key";

DROP INDEX IF EXISTS "UserConnector_userId_idx";

DROP INDEX IF EXISTS "UserConnector_templateId_idx";

DROP INDEX IF EXISTS "AppData_appId_userId_idx";

DROP INDEX IF EXISTS "AppData_appId_dataType_idx";

DROP INDEX IF EXISTS "AppRun_appId_idx";

DROP INDEX IF EXISTS "AppRun_userId_idx";

DROP INDEX IF EXISTS "AppConversation_userId_idx";

DROP INDEX IF EXISTS "Message_conversationId_idx";

DROP INDEX IF EXISTS "AppVersion_appId_idx";

DROP INDEX IF EXISTS "AppVersion_appId_version_key";

DROP INDEX IF EXISTS "ApiKey_userId_idx";

DROP INDEX IF EXISTS "ApiKey_userId_provider_key";

-- Create new indexes with snake_case names
CREATE UNIQUE INDEX "users_email_key" ON "users" ("email");

CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts" (
    "provider",
    "provider_account_id"
);

CREATE INDEX "accounts_user_id_idx" ON "accounts" ("user_id");

CREATE UNIQUE INDEX "apps_conversation_id_key" ON "apps" ("conversation_id");

CREATE INDEX "apps_user_id_idx" ON "apps" ("user_id");

CREATE UNIQUE INDEX "connector_templates_name_key" ON "connector_templates" ("name");

CREATE INDEX "user_connectors_user_id_idx" ON "user_connectors" ("user_id");

CREATE INDEX "user_connectors_template_id_idx" ON "user_connectors" ("template_id");

CREATE INDEX "app_data_app_id_user_id_idx" ON "app_data" ("app_id", "user_id");

CREATE INDEX "app_data_app_id_data_type_idx" ON "app_data" ("app_id", "data_type");

CREATE INDEX "app_runs_app_id_idx" ON "app_runs" ("app_id");

CREATE INDEX "app_runs_user_id_idx" ON "app_runs" ("user_id");

CREATE INDEX "app_conversations_user_id_idx" ON "app_conversations" ("user_id");

CREATE INDEX "messages_conversation_id_idx" ON "messages" ("conversation_id");

CREATE INDEX "app_versions_app_id_idx" ON "app_versions" ("app_id");

CREATE UNIQUE INDEX "app_versions_app_id_version_key" ON "app_versions" ("app_id", "version");

CREATE INDEX "api_keys_user_id_idx" ON "api_keys" ("user_id");

CREATE UNIQUE INDEX "api_keys_user_id_provider_key" ON "api_keys" ("user_id", "provider");

-- =============================================
-- STEP 5: Rename Foreign Key Constraints
-- =============================================

-- Accounts foreign keys
ALTER TABLE "accounts"
DROP CONSTRAINT IF EXISTS "Account_userId_fkey";

ALTER TABLE "accounts"
ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Apps foreign keys
ALTER TABLE "apps" DROP CONSTRAINT IF EXISTS "App_userId_fkey";

ALTER TABLE "apps"
DROP CONSTRAINT IF EXISTS "App_conversationId_fkey";

ALTER TABLE "apps"
ADD CONSTRAINT "apps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "apps"
ADD CONSTRAINT "apps_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "app_conversations" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- User Connectors foreign keys
ALTER TABLE "user_connectors"
DROP CONSTRAINT IF EXISTS "UserConnector_templateId_fkey";

ALTER TABLE "user_connectors"
DROP CONSTRAINT IF EXISTS "UserConnector_userId_fkey";

ALTER TABLE "user_connectors"
ADD CONSTRAINT "user_connectors_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "connector_templates" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "user_connectors"
ADD CONSTRAINT "user_connectors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- App Data foreign keys
ALTER TABLE "app_data"
DROP CONSTRAINT IF EXISTS "AppData_appId_fkey";

ALTER TABLE "app_data"
DROP CONSTRAINT IF EXISTS "AppData_userId_fkey";

ALTER TABLE "app_data"
ADD CONSTRAINT "app_data_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_data"
ADD CONSTRAINT "app_data_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- App Runs foreign keys
ALTER TABLE "app_runs" DROP CONSTRAINT IF EXISTS "AppRun_appId_fkey";

ALTER TABLE "app_runs"
DROP CONSTRAINT IF EXISTS "AppRun_userId_fkey";

ALTER TABLE "app_runs"
ADD CONSTRAINT "app_runs_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_runs"
ADD CONSTRAINT "app_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- App Conversations foreign keys
ALTER TABLE "app_conversations"
DROP CONSTRAINT IF EXISTS "AppConversation_userId_fkey";

ALTER TABLE "app_conversations"
ADD CONSTRAINT "app_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Messages foreign keys
ALTER TABLE "messages"
DROP CONSTRAINT IF EXISTS "Message_conversationId_fkey";

ALTER TABLE "messages"
ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "app_conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- App Versions foreign keys
ALTER TABLE "app_versions"
DROP CONSTRAINT IF EXISTS "AppVersion_appId_fkey";

ALTER TABLE "app_versions"
ADD CONSTRAINT "app_versions_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- API Keys foreign keys
ALTER TABLE "api_keys"
DROP CONSTRAINT IF EXISTS "ApiKey_userId_fkey";

ALTER TABLE "api_keys"
ADD CONSTRAINT "api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =============================================
-- STEP 6: Rename Primary Key Constraints
-- =============================================

ALTER TABLE "users" RENAME CONSTRAINT "User_pkey" TO "users_pkey";

ALTER TABLE "accounts"
RENAME CONSTRAINT "Account_pkey" TO "accounts_pkey";

ALTER TABLE "apps" RENAME CONSTRAINT "App_pkey" TO "apps_pkey";

ALTER TABLE "connector_templates"
RENAME CONSTRAINT "ConnectorTemplate_pkey" TO "connector_templates_pkey";

ALTER TABLE "user_connectors"
RENAME CONSTRAINT "UserConnector_pkey" TO "user_connectors_pkey";

ALTER TABLE "app_data"
RENAME CONSTRAINT "AppData_pkey" TO "app_data_pkey";

ALTER TABLE "app_runs"
RENAME CONSTRAINT "AppRun_pkey" TO "app_runs_pkey";

ALTER TABLE "app_conversations"
RENAME CONSTRAINT "AppConversation_pkey" TO "app_conversations_pkey";

ALTER TABLE "messages"
RENAME CONSTRAINT "Message_pkey" TO "messages_pkey";

ALTER TABLE "app_versions"
RENAME CONSTRAINT "AppVersion_pkey" TO "app_versions_pkey";

ALTER TABLE "api_keys"
RENAME CONSTRAINT "ApiKey_pkey" TO "api_keys_pkey";