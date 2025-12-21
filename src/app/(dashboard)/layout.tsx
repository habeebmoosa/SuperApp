"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="h-screen overflow-hidden bg-[var(--bg-primary)] flex">
            {/* Sidebar Component */}
            <Sidebar isCollapsed={isCollapsed} onCollapsedChange={setIsCollapsed} />

            {/* Main Content - Offset by sidebar width, independently scrollable */}
            <main
                className={cn(
                    "flex-1 h-screen overflow-auto dot-grid",
                    "transition-all duration-300 ease-out",
                    isCollapsed ? "ml-[72px]" : "ml-70"
                )}
            >
                <div className="w-full max-w-6xl mx-auto px-6 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
