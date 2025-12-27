# Supetron - AI-Powered Micro Apps Platform

## Project Walkthrough for Developers

> A comprehensive guide to understanding the Supetron codebase, architecture, and key systems.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Architecture](#core-architecture)
5. [Database Schema](#database-schema)
6. [Authentication System](#authentication-system)
7. [AI Generation System](#ai-generation-system)
8. [App Execution Engine](#app-execution-engine)
9. [API Routes](#api-routes)
10. [Frontend Components](#frontend-components)
11. [State Management](#state-management)
12. [Getting Started](#getting-started)

---

## Project Overview

**Supetron** is a no-code platform that enables users to create AI-powered micro applications using natural language prompts. Users describe what they want, and the AI generates a complete, functional app with:

- Input forms
- JavaScript execution logic
- Output displays
- Data persistence

### Key Features

- 🗣️ **Natural Language App Building** - Describe apps in plain English
- 🤖 **Multi-Provider AI Support** - OpenAI, Anthropic, Google, Groq, Mistral, DeepSeek
- 💾 **Built-in Data Storage** - Each app can persist its own data
- 🔌 **Connector Marketplace** - Integrate with Gmail, Notion, REST APIs
- 📊 **Rich Output Types** - Tables, cards, markdown, charts

---

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Next.js (App Router) | 16.1.0 |
| **Language** | TypeScript | 5.x |
| **Database** | PostgreSQL + Prisma ORM | 6.19.1 |
| **Authentication** | NextAuth.js | 4.24.13 |
| **AI SDK** | Vercel AI SDK | 6.0.3 |
| **State Management** | Zustand | 5.0.9 |
| **Styling** | TailwindCSS | 4.x |
| **Validation** | Zod | 3.25.76 |
| **Animation** | Framer Motion | 12.23.26 |

### AI Provider SDKs

```
@ai-sdk/openai, @ai-sdk/anthropic, @ai-sdk/google, 
@ai-sdk/groq, @ai-sdk/mistral, @ai-sdk/deepseek
```

---

## Project Structure

```
spt_project_code_01/
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma          # Prisma schema definition
│   ├── migrations/            # Database migrations
│   └── seed.js                # Database seeding
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages (login, register)
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── apps/          # User's apps list
│   │   │   ├── connectors/    # Connector management
│   │   │   └── settings/      # User settings
│   │   ├── api/               # API routes
│   │   │   ├── apps/          # CRUD for apps
│   │   │   ├── auth/          # NextAuth handlers
│   │   │   ├── connectors/    # Connector CRUD
│   │   │   ├── conversations/ # Chat history
│   │   │   ├── generate/      # AI app generation
│   │   │   └── settings/      # User settings API
│   │   ├── builder/           # App builder interface
│   │   ├── run/               # App execution page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── builder/           # Builder-specific components
│   │   ├── providers/         # Context providers
│   │   ├── settings/          # Settings components
│   │   ├── ui/                # Reusable UI components
│   │   └── Sidebar.tsx        # Dashboard sidebar
│   ├── generated/             # Prisma generated client
│   ├── lib/                   # Core libraries
│   │   ├── ai/                # AI orchestration
│   │   ├── auth/              # Auth configuration
│   │   ├── db/                # Database utilities
│   │   ├── engine/            # App execution engine
│   │   ├── templates/         # Pre-built app templates
│   │   └── utils/             # Utility functions
│   ├── schemas/               # Zod validation schemas
│   ├── stores/                # Zustand stores
│   └── types/                 # TypeScript types
├── docker-compose.yml         # Docker configuration
├── package.json               # Dependencies
└── tailwind.config.ts         # TailwindCSS config
```

---

## Core Architecture

### High-Level Flow

```mermaid
flowchart LR
    subgraph Frontend
        A[Landing Page] --> B[Auth Pages]
        B --> C[Dashboard]
        C --> D[App Builder]
        D --> E[App Runner]
    end
    
    subgraph Backend
        F[API Routes]
        G[AI Generation]
        H[Execution Engine]
        I[Database]
    end
    
    D --> F
    F --> G
    E --> H
    H --> I
    G --> I
```

### App Generation Flow

```mermaid
sequenceDiagram
    participant User
    participant Builder
    participant API
    participant AI
    participant DB
    
    User->>Builder: "Create expense tracker"
    Builder->>API: POST /api/generate
    API->>AI: generateAppConfig(prompt)
    AI-->>API: AppConfig + Code
    API->>DB: Store conversation & app
    API-->>Builder: Return generated app
    Builder->>User: Show preview
```

---

## Database Schema

The database uses **PostgreSQL** with **Prisma ORM**. Key models include:

### User Management

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  passwordHash String
  avatarUrl    String?
  
  apps           App[]
  conversations  AppConversation[]
  userConnectors UserConnector[]
  appRuns        AppRun[]
  appData        AppData[]
  apiKeys        ApiKey[]
}
```

### AI-Generated Apps

```prisma
model App {
  id             String    @id @default(cuid())
  name           String
  description    String?
  icon           String?
  currentVersion String    @default("1.0.0")
  status         AppStatus @default(DRAFT)
  appConfig      Json      // UI configuration
  appCode        String?   @db.Text // JavaScript code
  originalPrompt String?
  
  userId         String
  conversationId String?   @unique
  versions       AppVersion[]
  runs           AppRun[]
  data           AppData[]
}
```

### Connector System

```prisma
model ConnectorTemplate {
  id          String @id @default(cuid())
  name        String @unique
  type        ConnectorType  // OAUTH2 | REST_API
  category    String
  authUrl     String?
  tokenUrl    String?
  scopes      String[]
}

model UserConnector {
  id          String @id @default(cuid())
  name        String
  templateId  String
  authType    AuthType
  credentials Json?  // Encrypted
}
```

### App Data Storage

```prisma
model AppData {
  id       String @id @default(cuid())
  appId    String
  userId   String
  dataType String? // "expense", "habit", etc.
  data     Json    // Flexible JSON storage
}
```

### Key Enums

| Enum | Values |
|------|--------|
| `AppStatus` | DRAFT, ACTIVE, ARCHIVED |
| `RunStatus` | PENDING, RUNNING, SUCCESS, FAILED |
| `LLMProvider` | GOOGLE, OPENAI, ANTHROPIC, MISTRAL, GROQ, DEEPSEEK |
| `AuthType` | NONE, API_KEY, BASIC, BEARER, OAUTH2 |

---

## Authentication System

### Configuration

Located in `src/lib/auth/config.ts`

- **Provider**: Credentials (email/password)
- **Strategy**: JWT sessions
- **Session Duration**: 30 days

### Auth Flow

1. User submits email/password
2. Password verified with bcrypt
3. JWT token generated with user ID
4. Session stored in cookie

### Protected Routes

The `(dashboard)` route group is protected. Use `getCurrentUser()` from `@/lib/auth` to verify authentication in API routes:

```typescript
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // ... continue
}
```

---

## AI Generation System

### Location
`src/lib/ai/`

### Key Files

| File | Purpose |
|------|---------|
| `index.ts` | Main exports and generation functions |
| `factory.ts` | Provider factory (create models) |
| `prompts.ts` | System prompts for app generation |
| `providers/` | Individual AI provider configurations |

### Generation Functions

```typescript
// Generate new app from prompt
generateAppConfig(userPrompt: string, options?: GenerationOptions): Promise<AppConfig>

// Refine existing app based on feedback
refineAppConfig(currentConfig: AppConfig, refinement: string, options?: GenerationOptions): Promise<AppConfig>

// Stream generation for real-time preview
streamAppConfig(userPrompt: string, options?: GenerationOptions)

// Execute AI blocks within apps
executeAIBlock(systemPrompt: string, userPrompt: string, outputFormat: string, options?: GenerationOptions): Promise<string>
```

### Multi-Provider Support

Users can configure their own API keys for different providers via:

```typescript
model ApiKey {
  provider  LLMProvider
  apiKey    String      // Encrypted
  baseUrl   String?     // For Azure, self-hosted
  isDefault Boolean
}
```

### System Prompts

Located in `prompts.ts`:

1. **APP_PLANNING_PROMPT** - Designs app structure (inputs, outputs)
2. **CODE_GENERATION_PROMPT** - Generates JavaScript implementation
3. **APP_BUILDER_SYSTEM_PROMPT** - Single-shot full generation
4. **APP_REFINEMENT_PROMPT** - Updates existing apps

---

## App Execution Engine

### Location
`src/lib/engine/`

### Components

| File | Purpose |
|------|---------|
| `executor.ts` | Main execution orchestrator |
| `sandbox.ts` | Secure code execution environment |
| `validator.ts` | Code validation before execution |
| `helpers.ts` | Helper functions available to apps |

### Execution Flow

```mermaid
flowchart TD
    A[User Inputs] --> B[Type Coercion]
    B --> C[Code Validation]
    C --> D{Valid?}
    D -->|No| E[Return Error]
    D -->|Yes| F[Create Sandbox]
    F --> G[Inject Helpers]
    G --> H[Execute with Timeout]
    H --> I{Success?}
    I -->|No| J[Format Error]
    I -->|Yes| K[Map to Outputs]
    K --> L[Return Results]
```

### Available Helpers

Apps have access to these helper functions:

```javascript
// AI
helpers.ai(prompt, systemPrompt?) → string

// Database
helpers.db.store(dataType, data) → boolean
helpers.db.getAll(dataType) → array
helpers.db.query(dataType, limit) → array

// Utilities
helpers.utils.formatDate(date) → string
helpers.utils.formatCurrency(amount) → string
helpers.utils.generateId() → string

// HTTP
helpers.fetch(url, options?) → JSON
```

### Example Generated Code

```javascript
async function run(inputs, helpers) {
    const { amount, category, description } = inputs;
    
    if (amount && amount > 0) {
        await helpers.db.store('expense', {
            amount: amount,
            category: category || 'other',
            description: description || '',
            date: new Date().toISOString()
        });
    }
    
    const expenses = await helpers.db.getAll('expense');
    const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    
    return {
        message: amount ? 'Expense added!' : 'Your expenses',
        totalExpenses: helpers.utils.formatCurrency(total),
        expenseCount: expenses.length,
        recentExpenses: expenses.slice(0, 10).map(e => ({
            Amount: helpers.utils.formatCurrency(e.amount),
            Category: e.category,
            Description: e.description || '-'
        }))
    };
}
```

---

## API Routes

### Overview

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/auth/*` | NextAuth handlers | Authentication |
| `/api/generate` | POST | Generate app from prompt |
| `/api/apps` | GET, POST | List/create apps |
| `/api/apps/[id]` | GET, PATCH, DELETE | App CRUD |
| `/api/apps/[id]/run` | POST | Execute app |
| `/api/apps/[id]/data` | GET, POST | App data storage |
| `/api/apps/[id]/versions` | GET, POST | Version management |
| `/api/conversations` | GET, POST | Chat history |
| `/api/connectors` | CRUD | Connector management |
| `/api/settings/api-keys` | CRUD | User API keys |
| `/api/settings/providers` | GET | Available providers |

### Generate API

**POST `/api/generate`**

```typescript
// Request
{
  prompt: string,           // "Create an expense tracker"
  existingConfig?: AppConfig, // For refinement
  provider?: string,        // "openai", "google", etc.
  modelId?: string,         // "gpt-4o", "gemini-2.5-flash"
  conversationId?: string   // Link to conversation
}

// Response
{
  appConfig: AppConfig,
  appCode: string,
  conversationId: string,
  messageId: string
}
```

---

## Frontend Components

### UI Components

Located in `src/components/ui/`:

| Component | Purpose |
|-----------|---------|
| `Button` | Primary button with variants |
| `Card` | Glass-style card container |
| `ChatInput` | Multi-line chat input with voice |
| `DataTable` | Sortable data table |
| `Input` | Form input fields |
| `GlassButton` | Glassmorphism button |

### Builder Components

Located in `src/components/builder/`:

- `ModelSelector` - AI provider/model selection
- `AppPreview` - Live app preview (if exists)

### Key Pages

| Page | Path | Description |
|------|------|-------------|
| Landing | `/` | Marketing landing page |
| Login | `/login` | User authentication |
| Register | `/register` | User registration |
| Dashboard | `/apps` | User's apps list |
| Builder | `/builder` | AI chat-based app creation |
| App Runner | `/run/[appId]` | Execute generated apps |
| Settings | `/settings` | User preferences & API keys |

---

## State Management

### Zustand Stores

Located in `src/stores/`:

#### App Store

```typescript
// app-store.ts
interface AppStore {
  currentApp: App | null;
  apps: App[];
  setCurrentApp: (app: App) => void;
  setApps: (apps: App[]) => void;
  // ...
}
```

#### User Store

```typescript
// user-store.ts
interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  // ...
}
```

---

## App Configuration Schema

Located in `src/schemas/app-config.ts`

### AppConfig Structure

```typescript
interface AppConfig {
  version: "1.0";
  metadata: {
    name: string;
    description?: string;
    icon?: string;  // Emoji
    category?: string;
    tags?: string[];
  };
  inputs: InputField[];
  code?: string;  // JavaScript function
  logic?: LogicBlock[];  // Legacy
  outputs: OutputConfig[];
  dataSchema?: AppDataSchema;
  connectors?: string[];
  settings?: AppSettings;
}
```

### Input Types

```
text, textarea, number, email, url, date, datetime, 
time, select, multiselect, checkbox, radio, file, 
richtext, color, range
```

### Output Types

```
text, markdown, json, table, chart, image, 
download, copy, list, card
```

### Logic Blocks (Legacy)

- `ai_process` - Call AI for text processing
- `transform` - Data transformation
- `conditional` - If/else logic
- `loop` - Iterate over arrays
- `api_call` - External API calls
- `variable` - Set variables
- `data_store` - Save to database
- `data_query` - Query database

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- AI API key (Google Gemini by default)

### Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/supetron"

# Auth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# AI (Default provider)
GOOGLE_GENERATIVE_AI_API_KEY="your-google-api-key"
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev
```

### Available Scripts

| Script | Command |
|--------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Prisma Studio |

---

## Design System

### Theme Variables

The app uses CSS custom properties for theming:

```css
--bg-primary, --bg-secondary, --bg-tertiary
--text-primary, --text-secondary, --text-tertiary
--accent-primary
--glass-bg, --glass-border
--border-primary
```

### Glass Morphism

The UI extensively uses glassmorphism:

```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
}
```

---

## Summary

Supetron is a sophisticated AI-powered micro app platform built on modern technologies:

1. **Frontend**: Next.js 16 with App Router, TailwindCSS, Framer Motion
2. **Backend**: API routes with Prisma ORM on PostgreSQL
3. **AI**: Multi-provider support via Vercel AI SDK
4. **Security**: NextAuth with JWT sessions, encrypted credentials
5. **Execution**: Sandboxed JavaScript execution with type coercion

The architecture cleanly separates:
- **UI Configuration** (stored as JSON)
- **Business Logic** (stored as JavaScript code)
- **Data Storage** (flexible JSON per-app)

This enables the AI to generate complete, functional applications from natural language descriptions.
