# Supetron

**AI-Powered Micro App Platform** — Generate, customize, and run intelligent micro-applications using natural language.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwindcss)

## Overview

Supetron is a modern SaaS platform that enables users to create custom micro-applications through conversational AI. Simply describe what you want, and Supetron generates fully functional apps with UI, logic, and data storage capabilities.

### Key Features

- 🤖 **AI-Powered App Generation** — Create apps from natural language prompts
- 💬 **Conversational Builder** — Iterate and refine apps through chat
- 🎨 **Dynamic UI Rendering** — Beautiful, responsive app interfaces
- 📊 **Built-in Data Storage** — Flexible JSON storage for app data
- 🔐 **OAuth Authentication** — Google SSO + email/password login
- 🔌 **Multi-Provider AI** — Support for OpenAI, Google Gemini, Anthropic, Mistral, Groq, and DeepSeek
- 📱 **Responsive Design** — Works on desktop and mobile
- 🌙 **Dark/Light Mode** — Beautiful theme support

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19, TypeScript 5 |
| Styling | TailwindCSS 4, Framer Motion |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (OAuth + Credentials) |
| AI | Vercel AI SDK with multi-provider support |
| State | Zustand |
| Validation | Zod |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages (login, signup)
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   ├── builder/           # App builder interface
│   └── run/               # App execution runtime
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── builder/          # Builder-specific components
│   ├── providers/        # Context providers
│   └── settings/         # Settings dialog components
├── lib/                   # Core libraries
│   ├── ai/               # AI provider integrations
│   ├── auth/             # Authentication utilities
│   ├── db/               # Database client
│   ├── engine/           # App execution engine
│   └── utils/            # Helper utilities
├── stores/               # Zustand state stores
├── schemas/              # Zod validation schemas
└── types/                # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or cloud)
- AI provider API key (Google Gemini, OpenAI, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spt_project_code_01
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/supetron"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # AI Provider (at least one required)
   GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-key"
   
   # OAuth (optional)
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   
   # API Key Encryption
   API_KEY_ENCRYPTION_SECRET="your-32-byte-hex-key"
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Using Docker (Optional)

For local PostgreSQL development:

```bash
docker-compose up -d
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

## Database Schema

Key models:

- **User** — User accounts with OAuth support
- **App** — AI-generated applications with config and code
- **AppConversation** — Chat history for app creation
- **AppData** — Flexible JSON storage for app data
- **ApiKey** — User's LLM provider API keys
- **ConnectorTemplate** — Integration templates (Gmail, Notion, etc.)

## Supported AI Providers

Configure your preferred AI provider by adding API keys in Settings:

| Provider | Model Examples |
|----------|---------------|
| Google | Gemini 2.0, Gemini Pro |
| OpenAI | GPT-4o, GPT-4 Turbo |
| Anthropic | Claude 3.5, Claude 3 |
| Mistral | Mistral Large, Mistral Medium |
| Groq | Llama 3, Mixtral |
| DeepSeek | DeepSeek Chat |

## Documentation

For detailed guides and documentation, see:
- [GUIDE.md](./GUIDE.md) — Comprehensive project guide
- [dev.md](./dev.md) — Developer notes and architecture

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

---

Built with ❤️ using Next.js, React, and the power of AI.
