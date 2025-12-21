"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

interface ConnectorTemplate {
    id: string;
    name: string;
    icon?: string;
    category: string;
    type: "OAUTH2" | "REST_API";
    description?: string;
}

interface UserConnector {
    id: string;
    name: string;
    isActive: boolean;
    template: {
        name: string;
        icon?: string;
        category: string;
        type: string;
    };
}

const categoryIcons: Record<string, string> = {
    email: "📧",
    calendar: "📅",
    productivity: "📝",
    social: "📱",
    storage: "💾",
    custom: "🔌",
};

export default function ConnectorsPage() {
    const [templates, setTemplates] = useState<ConnectorTemplate[]>([]);
    const [userConnectors, setUserConnectors] = useState<UserConnector[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"marketplace" | "connected">("marketplace");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [templatesRes, connectorsRes] = await Promise.all([
                fetch("/api/connectors/templates"),
                fetch("/api/connectors"),
            ]);

            if (templatesRes.ok) {
                setTemplates(await templatesRes.json());
            }
            if (connectorsRes.ok) {
                setUserConnectors(await connectorsRes.json());
            }
        } catch (error) {
            console.error("Error fetching connectors:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const categories = [...new Set(templates.map((t) => t.category))];

    return (
        <div className="p-8 max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-1">Connectors</h1>
                <p className="text-sm text-[var(--text-secondary)]">
                    Connect your favorite services to use in your apps
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg w-fit mb-8">
                <button
                    onClick={() => setActiveTab("marketplace")}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                        activeTab === "marketplace"
                            ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                >
                    Marketplace
                </button>
                <button
                    onClick={() => setActiveTab("connected")}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                        activeTab === "connected"
                            ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                >
                    My Connections ({userConnectors.length})
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] animate-pulse" />
                    ))}
                </div>
            ) : activeTab === "marketplace" ? (
                <div className="space-y-8">
                    {categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-14 h-14 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-7 h-7 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                </svg>
                            </div>
                            <h3 className="font-semibold mb-1">No connectors available</h3>
                            <p className="text-sm text-[var(--text-tertiary)]">
                                Connector templates will be added soon.
                            </p>
                        </div>
                    ) : (
                        categories.map((category) => (
                            <div key={category}>
                                <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <span>{categoryIcons[category] || "🔌"}</span>
                                    {category}
                                </h2>
                                <div className="space-y-2">
                                    {templates
                                        .filter((t) => t.category === category)
                                        .map((template) => (
                                            <Card key={template.id} hover padding="sm" className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center text-lg shrink-0">
                                                    {template.icon || categoryIcons[template.category] || "🔌"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-sm">{template.name}</h3>
                                                    <p className="text-xs text-[var(--text-tertiary)] truncate">
                                                        {template.description || `Connect to ${template.name}`}
                                                    </p>
                                                </div>
                                                <Button variant="secondary" size="sm">
                                                    Connect
                                                </Button>
                                            </Card>
                                        ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : userConnectors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-14 h-14 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-7 h-7 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                        </svg>
                    </div>
                    <h3 className="font-semibold mb-1">No connections yet</h3>
                    <p className="text-sm text-[var(--text-tertiary)] mb-5">
                        Browse the marketplace to connect services.
                    </p>
                    <Button variant="secondary" onClick={() => setActiveTab("marketplace")}>
                        Browse Marketplace
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    {userConnectors.map((connector) => (
                        <Card key={connector.id} padding="sm" className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center text-lg shrink-0">
                                {connector.template.icon || categoryIcons[connector.template.category] || "🔌"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm">{connector.name}</h3>
                                <p className="text-xs text-[var(--text-tertiary)]">{connector.template.name}</p>
                            </div>
                            <div
                                className={cn(
                                    "w-2 h-2 rounded-full",
                                    connector.isActive ? "bg-[var(--accent-success)]" : "bg-[var(--text-tertiary)]"
                                )}
                            />
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
