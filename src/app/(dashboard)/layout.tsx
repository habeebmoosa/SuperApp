"use client";

import { ReactNode, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Sidebar, MobileHeader } from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleMobileOpenChange = useCallback((open: boolean) => {
        setIsMobileOpen(open);
    }, []);

    return (
        <div className="h-screen overflow-hidden bg-[var(--bg-primary)] flex">
            {/* Mobile Header with hamburger */}
            <MobileHeader onMenuClick={() => setIsMobileOpen(true)} />

            {/* Sidebar Component */}
            <Sidebar
                isCollapsed={isCollapsed}
                onCollapsedChange={setIsCollapsed}
                isMobileOpen={isMobileOpen}
                onMobileOpenChange={handleMobileOpenChange}
            />

            {/* Main Content */}
            <main
                className={cn(
                    "flex-1 h-screen overflow-auto dot-grid",
                    "transition-all duration-300 ease-out",
                    // Desktop: offset by sidebar width
                    "lg:ml-70",
                    isCollapsed && "lg:ml-[72px]",
                    // Mobile: add top padding for header
                    "pt-14 lg:pt-0"
                )}
            >
                <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
