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
        <div>
            {/* Header - Stack on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-10">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-light mb-1 sm:mb-2">My Apps</h1>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono">
                        Create and manage your AI-powered micro apps
                    </p>
                </div>
                <Link href="/apps/new" className="w-full sm:w-auto">
                    <Button className="animate-glow w-full sm:w-auto">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Create App
                    </Button>
                </Link>
            </div>

            {/* Apps Grid - Single column on mobile */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-40 sm:h-48 rounded-xl sm:rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] animate-pulse"
                        />
                    ))}
                </div>
            ) : apps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 glass rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-light mb-2">No apps yet</h3>
                    <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mb-6 sm:mb-8 text-center max-w-sm font-mono">
                        Create your first AI-powered app by describing what you need in natural language.
                    </p>
                    <Link href="/apps/new" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-auto">Create Your First App</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {apps.map((app, index) => (
                        <Link key={app.id} href={`/apps/${app.id}`}>
                            <Card
                                hover
                                padding="md"
                                className={cn(
                                    "h-full cursor-pointer group animate-fadeInUp",
                                    `stagger-${Math.min(index + 1, 5)}`
                                )}
                            >
                                <div className="flex items-start justify-between mb-4 sm:mb-5">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 glass rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl">
                                        {app.icon || "🤖"}
                                    </div>
                                    <span className={cn(
                                        "px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-medium uppercase tracking-wider",
                                        statusStyles[app.status]
                                    )}>
                                        {app.status}
                                    </span>
                                </div>
                                <h3 className="font-medium text-base sm:text-lg mb-1 sm:mb-1.5 group-hover:text-[var(--accent-primary)] transition-colors truncate">
                                    {app.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 sm:mb-5">
                                    {app.description || "No description"}
                                </p>
                                <div className="flex items-center gap-4 sm:gap-5 text-[10px] sm:text-xs text-[var(--text-tertiary)] font-mono">
                                    <span className="flex items-center gap-1 sm:gap-1.5">
                                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                        </svg>
                                        <span className="bracket">{app._count.runs}</span> runs
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
