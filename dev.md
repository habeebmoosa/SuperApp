## SuperApp - Complete Project Overview
🎯 What is SuperApp?
SuperApp is an AI-powered micro-app builder that lets users create functional web applications using natural language prompts. Instead of writing code, users simply describe what they want (e.g., "Build me an expense tracker") and the AI generates a fully working app.

💡 Core Concept
User Prompt → AI (Gemini) → App Config + JavaScript Code → Runnable App
     ↓
"Create an expense tracker"
     ↓
AI generates:
  - UI definition (inputs, outputs)
  - JavaScript code for functionality
     ↓
Users can run the app, store data, and see results
🛠️ Tech Stack
Layer	Technology
Frontend	Next.js 16 (App Router), React 19, TypeScript
Styling	Tailwind CSS 4, CSS Variables (dark/light themes)
Backend	Next.js API Routes (serverless functions)
Database	PostgreSQL (via Docker)
ORM	Prisma 6
Authentication	NextAuth.js (credentials provider)
AI	Google Gemini 2.5 Flash (via Vercel AI SDK)
State Management	Zustand
Validation	Zod 3
📁 Project Structure
spt_project_code_01/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, register)
│   │   ├── (dashboard)/        # Protected dashboard
│   │   │   ├── apps/           # App list & detail pages
│   │   │   ├── connectors/     # External service connections
│   │   │   └── settings/       # User settings
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # NextAuth endpoints
│   │   │   ├── apps/           # CRUD for apps + /run endpoint
│   │   │   ├── connectors/     # Connector management
│   │   │   └── generate/       # AI app generation
│   │   ├── globals.css         # Design system
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   │
│   ├── components/
│   │   ├── ui/                 # Reusable components (Button, Card, Input)
│   │   └── providers/          # Context providers
│   │
│   ├── lib/
│   │   ├── ai/                 # Gemini integration & prompts
│   │   ├── auth/               # NextAuth config
│   │   ├── db/                 # Prisma client
│   │   ├── engine/             # App execution engine
│   │   │   ├── executor.ts     # Main execution logic
│   │   │   ├── sandbox.ts      # Safe code execution
│   │   │   └── helpers.ts      # AI, DB, fetch helpers
│   │   └── utils/              # Utility functions
│   │
│   ├── schemas/                # Zod validation schemas
│   │   └── app-config.ts       # AppConfig schema
│   │
│   ├── stores/                 # Zustand state stores
│   └── types/                  # TypeScript types
│
├── prisma/
│   ├── schema.prisma           # Database models
│   └── seed.js                 # Initial data seeding
│
├── docker-compose.yml          # PostgreSQL container
└── package.json
🗄️ Database Models
User
├── id, email, name, password
├── createdAt, updatedAt
├── Apps[], UserConnectors[], AppRuns[]
App
├── id, name, description, icon
├── status (DRAFT/ACTIVE/ARCHIVED)
├── appConfig (JSON) ← Contains inputs, code, outputs
└── userId → User
AppData (for app-specific storage)
├── id, appId, userId, dataType
├── data (JSON) ← Stores expenses, todos, etc.
ConnectorTemplate (marketplace)
├── id, name, type (GMAIL, NOTION, etc.)
├── authType (OAUTH2, API_KEY)
UserConnector (user's connected services)
├── id, templateId, userId
├── credentials (encrypted)
🔄 How App Creation Works
User describes app → "Build an expense tracker with categories"
API calls Gemini → /api/generate
typescript
const { object } = await generateObject({
  model: google("gemini-2.5-flash"),
  schema: AppConfigSchema,
  prompt: userPrompt,
});
AI returns AppConfig with code:
json
{
  "version": "1.0",
  "metadata": { "name": "Expense Tracker", "icon": "💰" },
  "inputs": [
    { "id": "amount", "type": "number", "label": "Amount" },
    { "id": "category", "type": "select", "options": [...] }
  ],
  "code": "async function run(inputs, helpers) { ... }",
  "outputs": [
    { "id": "total", "type": "text", "source": "{{totalExpenses}}" },
    { "id": "list", "type": "table", "source": "{{recentExpenses}}" }
  ]
}
User saves app → Stored in database
User runs app → /api/apps/[id]/run
Code executes in sandbox with helpers
Data stored/retrieved via helpers.db
Results returned to frontend
🔒 Execution Security
Protection	Implementation
Timeout	30-second limit per execution
Sandboxed	Code runs via AsyncFunction constructor
Rate limited	Database operations controlled
HTTPS only	External fetch restricted to HTTPS
No file access	No filesystem APIs exposed
🎨 UI/UX Features
Dark/Light theme with CSS variables
Responsive design with Tailwind CSS
Premium aesthetic inspired by Nothing Playground