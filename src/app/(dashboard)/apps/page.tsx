"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

interface App {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    status: "DRAFT" | "ACTIVE" | "ARCHIVED";
    currentVersion?: string;
    conversationId?: string;
    createdAt: string;
    updatedAt: string;
    _count: {
        runs: number;
    };
}

export default function AppsPage() {
    const [apps, setApps] = useState<App[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [renameApp, setRenameApp] = useState<{ id: string; name: string } | null>(null);
    const [deleteApp, setDeleteApp] = useState<App | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        fetchApps();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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

    const handleRename = async (id: string, newName: string) => {
        try {
            const res = await fetch(`/api/apps/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName }),
            });
            if (res.ok) {
                setApps(apps.map(app => app.id === id ? { ...app, name: newName } : app));
            }
        } catch (error) {
            console.error("Error renaming app:", error);
        } finally {
            setRenameApp(null);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/apps/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setApps(apps.filter(app => app.id !== id));
            }
        } catch (error) {
            console.error("Error deleting app:", error);
        } finally {
            setDeleteApp(null);
        }
    };

    const handleEdit = (app: App) => {
        if (app.conversationId) {
            router.push(`/builder/${app.conversationId}`);
        } else {
            // Create a new conversation for editing this app
            router.push(`/builder?appId=${app.id}`);
        }
        setOpenMenuId(null);
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
                <Link href="/builder" className="w-full sm:w-auto">
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
                    <Link href="/builder" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-auto">Create Your First App</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {apps.map((app, index) => (
                        <div key={app.id} className="relative">
                            <Link href={`/run/${app.id}`}>
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
                                        <div className="flex items-center gap-2" ref={openMenuId === app.id ? menuRef : null}>
                                            <span className={cn(
                                                "px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-medium uppercase tracking-wider",
                                                statusStyles[app.status]
                                            )}>
                                                {app.status}
                                            </span>

                                            {/* 3-dot Menu Button - inline with status */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === app.id ? null : app.id);
                                                }}
                                                className="p-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--text-tertiary)] transition-all"
                                            >
                                                <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="currentColor" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="5" r="2" />
                                                    <circle cx="12" cy="12" r="2" />
                                                    <circle cx="12" cy="19" r="2" />
                                                </svg>
                                            </button>

                                            {/* Dropdown Menu */}
                                            {openMenuId === app.id && (
                                                <div className="absolute right-4 top-14 w-44 bg-[var(--bg-secondary)]/90 backdrop-blur-xl rounded-xl border border-[var(--border-primary)] py-2 shadow-2xl z-20 overflow-hidden">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setRenameApp({ id: app.id, name: app.name });
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-3"
                                                    >
                                                        <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                        </svg>
                                                        Rename
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleEdit(app);
                                                        }}
                                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-3"
                                                    >
                                                        <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    <div className="h-px bg-[var(--border-primary)] my-1 mx-2" />
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setDeleteApp(app);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--accent-error)]/10 text-[var(--accent-error)] transition-colors flex items-center gap-3"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
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
                                        {app.currentVersion && (
                                            <span>v{app.currentVersion}</span>
                                        )}
                                        <span>{new Date(app.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </Card>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Rename Modal */}
            {renameApp && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-2xl p-6 w-full max-w-md border border-[var(--border-primary)]">
                        <h3 className="text-lg font-medium mb-4">Rename App</h3>
                        <input
                            type="text"
                            value={renameApp.name}
                            onChange={(e) => setRenameApp({ ...renameApp, name: e.target.value })}
                            className="w-full px-4 py-3 glass rounded-xl border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none font-mono text-sm mb-4"
                            autoFocus
                        />
                        <div className="flex gap-3 justify-end">
                            <Button variant="ghost" onClick={() => setRenameApp(null)}>Cancel</Button>
                            <Button onClick={() => handleRename(renameApp.id, renameApp.name)}>Save</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteApp && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-2xl p-6 w-full max-w-md border border-[var(--border-primary)]">
                        <div className="w-12 h-12 rounded-xl bg-[var(--accent-error)]/10 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-[var(--accent-error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium mb-2">Delete &ldquo;{deleteApp.name}&rdquo;?</h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-6">
                            This action cannot be undone. All data associated with this app will be permanently deleted.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button variant="ghost" onClick={() => setDeleteApp(null)}>Cancel</Button>
                            <Button
                                className="bg-[var(--accent-error)] hover:bg-[var(--accent-error)]/90 text-white"
                                onClick={() => handleDelete(deleteApp.id)}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
