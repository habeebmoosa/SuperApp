import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import type { Account } from "@/generated/prisma";

// Check if Google OAuth is configured
const isGoogleConfigured = !!(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

// Build providers array dynamically
const providers: NextAuthOptions["providers"] = [
    CredentialsProvider({
        name: "credentials",
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
                throw new Error("Invalid credentials");
            }

            const user = await prisma.user.findUnique({
                where: { email: credentials.email },
            });

            // User not found or no password (OAuth-only user)
            if (!user || !user.passwordHash) {
                throw new Error("Invalid credentials");
            }

            const isPasswordValid = await bcrypt.compare(
                credentials.password,
                user.passwordHash
            );

            if (!isPasswordValid) {
                throw new Error("Invalid credentials");
            }

            return {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.avatarUrl,
            };
        },
    }),
];

// Add Google provider only if configured
if (isGoogleConfigured) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true, // Allow linking with existing email
        })
    );
}

export const authOptions: NextAuthOptions = {
    providers,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/login",
        signOut: "/",
        error: "/login",
    },
    callbacks: {
        async signIn({ user, account }) {
            // For OAuth sign-ins, create or link user
            if (account?.provider === "google" && user.email) {
                try {
                    // Check if user exists
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email },
                        include: { accounts: true },
                    });

                    if (existingUser) {
                        // Check if this Google account is already linked
                        const existingAccount = existingUser.accounts.find(
                            (acc: Account) =>
                                acc.provider === "google" &&
                                acc.providerAccountId === account.providerAccountId
                        );

                        if (!existingAccount) {
                            // Link the Google account to existing user
                            await prisma.account.create({
                                data: {
                                    userId: existingUser.id,
                                    type: account.type,
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId,
                                    access_token: account.access_token,
                                    refresh_token: account.refresh_token,
                                    expires_at: account.expires_at,
                                    token_type: account.token_type,
                                    scope: account.scope,
                                    id_token: account.id_token,
                                    session_state: account.session_state as string | null,
                                },
                            });
                        }

                        // Update avatar if not set
                        if (!existingUser.avatarUrl && user.image) {
                            await prisma.user.update({
                                where: { id: existingUser.id },
                                data: { avatarUrl: user.image },
                            });
                        }
                    } else {
                        // Create new user with Google account
                        await prisma.user.create({
                            data: {
                                email: user.email,
                                name: user.name,
                                avatarUrl: user.image,
                                emailVerified: new Date(),
                                accounts: {
                                    create: {
                                        type: account.type,
                                        provider: account.provider,
                                        providerAccountId: account.providerAccountId,
                                        access_token: account.access_token,
                                        refresh_token: account.refresh_token,
                                        expires_at: account.expires_at,
                                        token_type: account.token_type,
                                        scope: account.scope,
                                        id_token: account.id_token,
                                        session_state: account.session_state as string | null,
                                    },
                                },
                            },
                        });
                    }
                } catch (error) {
                    console.error("OAuth sign-in error:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                // First-time sign in
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
            }

            // For OAuth, we need to get the database user ID
            if (account?.provider === "google" && token.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: token.email },
                });
                if (dbUser) {
                    token.id = dbUser.id;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.image = token.picture as string | undefined;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

// Export helper to check OAuth availability (for client components)
export const oauthProviders = {
    google: isGoogleConfigured,
};
