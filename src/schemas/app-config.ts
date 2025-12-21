import { z } from "zod";

// ============================================
// KEY-VALUE PAIR SCHEMA (Gemini compatible)
// ============================================

const KeyValuePairSchema = z.object({
    key: z.string(),
    value: z.string(),
});

// ============================================
// VALIDATION RULES
// ============================================

const ValidationRuleSchema = z.object({
    type: z.enum(["required", "minLength", "maxLength", "pattern", "min", "max", "email", "url"]),
    value: z.union([z.string(), z.number(), z.boolean()]).optional(),
    message: z.string().optional(),
});

// ============================================
// CONDITIONAL LOGIC
// ============================================

const ConditionalLogicSchema = z.object({
    field: z.string(),
    operator: z.enum(["equals", "notEquals", "contains", "greaterThan", "lessThan", "isEmpty", "isNotEmpty"]),
    value: z.any().optional(),
});

// ============================================
// SELECT OPTIONS
// ============================================

const SelectOptionSchema = z.object({
    label: z.string(),
    value: z.string(),
});

// ============================================
// INPUT FIELDS
// ============================================

export const InputFieldSchema = z.object({
    id: z.string(),
    type: z.enum([
        "text",
        "textarea",
        "number",
        "email",
        "url",
        "date",
        "datetime",
        "time",
        "select",
        "multiselect",
        "checkbox",
        "radio",
        "file",
        "richtext",
        "color",
        "range",
    ]),
    label: z.string(),
    placeholder: z.string().optional(),
    required: z.boolean().optional().default(false),
    defaultValue: z.any().optional(),
    validation: z.array(ValidationRuleSchema).optional(),
    options: z.array(SelectOptionSchema).optional(),
    conditional: ConditionalLogicSchema.optional(),
    helpText: z.string().optional(),
});

// ============================================
// LOGIC BLOCKS
// ============================================

const AIProcessBlockSchema = z.object({
    type: z.literal("ai_process"),
    id: z.string(),
    model: z.string().optional(),
    systemPrompt: z.string().optional(),
    userPromptTemplate: z.string(), // Can reference {{inputs.fieldId}}
    outputVariable: z.string(),
    outputFormat: z.enum(["text", "json", "list", "markdown"]).optional().default("text"),
});

const TransformBlockSchema = z.object({
    type: z.literal("transform"),
    id: z.string(),
    operation: z.enum(["map", "filter", "reduce", "format", "parse", "join", "split"]),
    input: z.string(), // Variable reference
    expression: z.string().optional(),
    outputVariable: z.string(),
});

const ConditionalBlockSchema = z.object({
    type: z.literal("conditional"),
    id: z.string(),
    condition: z.string(), // Expression that evaluates to boolean
    thenBlocks: z.array(z.string()), // IDs of blocks to execute if true
    elseBlocks: z.array(z.string()).optional(), // IDs of blocks to execute if false
});

const LoopBlockSchema = z.object({
    type: z.literal("loop"),
    id: z.string(),
    items: z.string(), // Variable reference to array
    itemVariable: z.string(), // Variable name for current item
    blocks: z.array(z.string()), // IDs of blocks to execute for each item
    outputVariable: z.string(),
});

const APICallBlockSchema = z.object({
    type: z.literal("api_call"),
    id: z.string(),
    connectorId: z.string(), // Reference to user's connector
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
    endpoint: z.string(), // Can use {{variables}}
    queryParams: z.array(KeyValuePairSchema).optional(), // Array of {key, value} pairs
    bodyTemplate: z.string().optional(), // JSON template as string
    headers: z.array(KeyValuePairSchema).optional(), // Array of {key, value} pairs
    outputVariable: z.string(),
});

const VariableBlockSchema = z.object({
    type: z.literal("variable"),
    id: z.string(),
    name: z.string(),
    value: z.any(), // Can be template string with {{variables}}
});

const DataStoreBlockSchema = z.object({
    type: z.literal("data_store"),
    id: z.string(),
    dataType: z.string(), // e.g., "expense", "habit"
    recordFields: z.array(KeyValuePairSchema), // Array of {key, value} pairs with templates
});

const DataQueryBlockSchema = z.object({
    type: z.literal("data_query"),
    id: z.string(),
    dataType: z.string(),
    filterConditions: z.array(KeyValuePairSchema).optional(), // Array of {key, value} filter pairs
    orderBy: z.string().optional(),
    limit: z.number().optional(),
    outputVariable: z.string(),
});

export const LogicBlockSchema = z.discriminatedUnion("type", [
    AIProcessBlockSchema,
    TransformBlockSchema,
    ConditionalBlockSchema,
    LoopBlockSchema,
    APICallBlockSchema,
    VariableBlockSchema,
    DataStoreBlockSchema,
    DataQueryBlockSchema,
]);

// ============================================
// OUTPUT CONFIGURATION
// ============================================

const OutputStylingSchema = z.object({
    size: z.enum(["xs", "sm", "md", "lg", "xl"]).optional(),
    color: z.string().optional(),
    align: z.enum(["left", "center", "right"]).optional(),
});

export const OutputConfigSchema = z.object({
    id: z.string(),
    type: z.enum([
        "text",
        "markdown",
        "json",
        "table",
        "chart",
        "image",
        "download",
        "copy",
        "list",
        "card",
    ]),
    label: z.string().optional(),
    source: z.string(), // Variable reference or template
    styling: OutputStylingSchema.optional(),
});

// ============================================
// DATA SCHEMA (for app-specific storage)
// ============================================

const DataFieldSchema = z.object({
    name: z.string(),
    type: z.enum(["string", "number", "boolean", "date", "json", "array"]),
    required: z.boolean().optional(),
});

const AppDataSchemaSchema = z.object({
    enabled: z.boolean(),
    dataType: z.string(), // e.g., "expense", "habit"
    fields: z.array(DataFieldSchema),
});

// ============================================
// APP SETTINGS
// ============================================

const AppSettingsSchema = z.object({
    allowMultipleRuns: z.boolean().optional().default(true),
    cacheResults: z.boolean().optional().default(false),
    cacheDuration: z.number().optional(), // seconds
    requireAuth: z.boolean().optional().default(true),
    rateLimit: z.number().optional(), // requests per minute
});

// ============================================
// METADATA
// ============================================

const AppMetadataSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    icon: z.string().optional(), // Emoji or icon name
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
});

// ============================================
// UNIVERSAL APP CONFIG SCHEMA
// ============================================

export const AppConfigSchema = z.object({
    version: z.literal("1.0"),
    metadata: AppMetadataSchema,
    inputs: z.array(InputFieldSchema),
    logic: z.array(LogicBlockSchema),
    outputs: z.array(OutputConfigSchema),
    dataSchema: AppDataSchemaSchema.optional(),
    connectors: z.array(z.string()).optional(), // UserConnector IDs
    settings: AppSettingsSchema.optional(),
});

// ============================================
// TYPES
// ============================================

export type AppConfig = z.infer<typeof AppConfigSchema>;
export type InputField = z.infer<typeof InputFieldSchema>;
export type LogicBlock = z.infer<typeof LogicBlockSchema>;
export type OutputConfig = z.infer<typeof OutputConfigSchema>;
export type ValidationRule = z.infer<typeof ValidationRuleSchema>;
