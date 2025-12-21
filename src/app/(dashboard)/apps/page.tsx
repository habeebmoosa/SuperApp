"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

interface App {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    status: "DRAFT" | "ACTIVE" | "ARCHIVED";
    createdAt: string;
    updatedAt: string;
    _count: {
        runs: number;
    };
}

export default function AppsPage() {
    const [apps, setApps] = useState<App[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        try {
            const res = await fetch("/api/apps");
            if (res.ok) {
                const data = await res.json();
                setApps(data);
            }
        } catch (error) {
            console.error("Error fetching apps:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const statusStyles = {
        DRAFT: "bg-[var(--accent-warning)]/10 text-[var(--accent-warning)]",
        ACTIVE: "bg-[var(--accent-success)]/10 text-[var(--accent-success)]",
        ARCHIVED: "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]",
    };

    return (
        <div className="p-8 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold mb-1">My Apps</h1>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Create and manage your AI-powered micro apps
                    </p>
                </div>
                <Link href="/apps/new">
                    <Button>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Create App
                    </Button>
                </Link>
            </div>

            {/* Apps Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-44 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] animate-pulse"
                        />
                    ))}
                </div>
            ) : apps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center mb-5">
                        <svg className="w-8 h-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">No apps yet</h3>
                    <p className="text-sm text-[var(--text-tertiary)] mb-6 text-center max-w-sm">
                        Create your first AI-powered app by describing what you need in natural language.
                    </p>
                    <Link href="/apps/new">
                        <Button>Create Your First App</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {apps.map((app) => (
                        <Link key={app.id} href={`/apps/${app.id}`}>
                            <Card hover padding="md" className="h-full cursor-pointer group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-11 h-11 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center text-xl">
                                        {app.icon || "🤖"}
                                    </div>
                                    <span className={cn("px-2 py-1 rounded-full text-[11px] font-medium uppercase tracking-wide", statusStyles[app.status])}>
                                        {app.status}
                                    </span>
                                </div>
                                <h3 className="font-semibold mb-1 group-hover:text-[var(--accent-primary)] transition-colors">
                                    {app.name}
                                </h3>
                                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">
                                    {app.description || "No description"}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                        </svg>
                                        {app._count.runs} runs
                                    </span>
                                    <span>{new Date(app.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
