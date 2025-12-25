"use client";

import { useSession, signOut } from "next-auth/react";
import { Button, Card } from "@/components/ui";
import { ApiKeysSettings } from "@/components/settings";

export default function SettingsPage() {
    const { data: session } = useSession();

    return (
        <div className="p-8 max-w-2xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold mb-1">Settings</h1>
                <p className="text-sm text-[var(--text-secondary)]">
                    Manage your account and preferences
                </p>
            </div>

            <div className="space-y-5">
                {/* Profile Section */}
                <Card padding="md">
                    <h2 className="font-semibold mb-4">Profile</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center">
                            <span className="text-xl font-medium text-[var(--text-secondary)]">
                                {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
                            </span>
                        </div>
                        <div>
                            <p className="font-medium">{session?.user?.name || "User"}</p>
                            <p className="text-sm text-[var(--text-secondary)]">{session?.user?.email}</p>
                        </div>
                    </div>
                </Card>

                {/* API Keys Section */}
                <ApiKeysSettings />

                {/* Account Section */}
                <Card padding="md">
                    <h2 className="font-semibold mb-4">Account</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-[var(--border-primary)]">
                            <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-[var(--text-secondary)]">{session?.user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm font-medium">Password</p>
                                <p className="text-sm text-[var(--text-secondary)]">••••••••</p>
                            </div>
                            <Button variant="secondary" size="sm" disabled>
                                Change
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Appearance Section */}
                <Card padding="md">
                    <h2 className="font-semibold mb-4">Appearance</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Theme</p>
                            <p className="text-sm text-[var(--text-secondary)]">Currently using dark theme</p>
                        </div>
                        <Button variant="secondary" size="sm" disabled>
                            Coming Soon
                        </Button>
                    </div>
                </Card>

                {/* Danger Zone */}
                <Card padding="md" className="border-[var(--accent-error)]/30">
                    <h2 className="font-semibold mb-4 text-[var(--accent-error)]">Danger Zone</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Sign Out</p>
                            <p className="text-sm text-[var(--text-secondary)]">Sign out of your account</p>
                        </div>
                        <Button variant="danger" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                            Sign Out
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

