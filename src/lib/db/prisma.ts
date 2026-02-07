import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Fix for Supabase PgBouncer "prepared statement already exists" error
// Append pgbouncer=true and statement_cache_size=0 to the DATABASE_URL
function getDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  // Only modify if it's a Supabase pooled connection
  if (url.includes('pooler.supabase.com') || url.includes('supabase.co')) {
    const separator = url.includes('?') ? '&' : '?';
    // pgbouncer=true tells Prisma to not use prepared statements
    // statement_cache_size=0 disables statement caching
    if (!url.includes('pgbouncer=true')) {
      return `${url}${separator}pgbouncer=true&statement_cache_size=0`;
    }
  }
  return url;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: getDatasourceUrl(),
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
