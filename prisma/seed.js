// Seed script for SuperApp database
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // Create connector templates
    const templates = [
        {
            name: "Gmail",
            icon: "📧",
            category: "email",
            type: "OAUTH2",
            description: "Send and manage emails via Gmail",
            authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
            tokenUrl: "https://oauth2.googleapis.com/token",
            scopes: ["https://mail.google.com/"],
        },
        {
            name: "Google Calendar",
            icon: "📅",
            category: "calendar",
            type: "OAUTH2",
            description: "Manage calendar events",
            authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
            tokenUrl: "https://oauth2.googleapis.com/token",
            scopes: ["https://www.googleapis.com/auth/calendar"],
        },
        {
            name: "Notion",
            icon: "📝",
            category: "productivity",
            type: "OAUTH2",
            description: "Connect to Notion workspaces",
            authUrl: "https://api.notion.com/v1/oauth/authorize",
            tokenUrl: "https://api.notion.com/v1/oauth/token",
            scopes: [],
        },
        {
            name: "REST API",
            icon: "🔌",
            category: "custom",
            type: "REST_API",
            description: "Connect to any REST API",
        },
    ];

    for (const template of templates) {
        await prisma.connectorTemplate.upsert({
            where: { name: template.name },
            update: template,
            create: template,
        });
    }

    console.log("Seeding complete! Created", templates.length, "connector templates.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
