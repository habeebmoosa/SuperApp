"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

const navigation = [
    {
        name: "Apps",
        href: "/apps",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
        ),
    },
    {
        name: "Routines",
        href: "#",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
        ),
    },
    {
        name: "Connectors",
        href: "/connectors",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
        ),
    },
    {
        name: "Settings",
        href: "/settings",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
];

interface SidebarProps {
    isCollapsed: boolean;
    onCollapsedChange: (collapsed: boolean) => void;
    isMobileOpen: boolean;
    onMobileOpenChange: (open: boolean) => void;
}

export function Sidebar({ isCollapsed, onCollapsedChange, isMobileOpen, onMobileOpenChange }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { theme, toggleTheme } = useTheme();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const desktopMenuRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            // Check if click is outside BOTH refs (one will be the visible menu)
            const isOutsideDesktop = !desktopMenuRef.current?.contains(target);
            const isOutsideMobile = !mobileMenuRef.current?.contains(target);

            if (isOutsideDesktop && isOutsideMobile) {
                setIsProfileMenuOpen(false);
            }
        }
        // Use click instead of mousedown to ensure button onClick handlers complete first
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        onMobileOpenChange(false);
    }, [pathname, onMobileOpenChange]);

    const sidebarContent = (menuRef: React.RefObject<HTMLDivElement | null>) => (
        <>
            {/* Logo Header - Collapse button only when expanded */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-[var(--border-primary)] flex-shrink-0">
                <Link href="/apps" className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-9 h-9 bg-[var(--accent-primary)] rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-[var(--text-inverted)] font-bold text-sm font-mono">S</span>
                    </div>
                    {(!isCollapsed || isMobileOpen) && (
                        <span className="font-mono font-medium text-[var(--text-primary)] whitespace-nowrap text-xl">
                            Supetron
                        </span>
                    )}
                </Link>
                {/* Close button on mobile, Collapse button on desktop when expanded */}
                {isMobileOpen ? (
                    <button
                        onClick={() => onMobileOpenChange(false)}
                        className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center lg:hidden",
                            "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]",
                            "hover:bg-[var(--bg-tertiary)] transition-all duration-200"
                        )}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                ) : !isCollapsed && (
                    <button
                        onClick={() => onCollapsedChange(true)}
                        className={cn(
                            "h-8 w-8 rounded-lg items-center justify-center hidden lg:flex",
                            "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]",
                            "hover:bg-[var(--bg-tertiary)] transition-all duration-200"
                        )}
                        title="Collapse sidebar"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="p-3 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => onMobileOpenChange(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                                isActive
                                    ? "text-[var(--accent-primary)] bg-[var(--accent-primary)]/10"
                                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]",
                                isCollapsed && !isMobileOpen && "justify-center px-0"
                            )}
                            title={isCollapsed && !isMobileOpen ? item.name : undefined}
                        >
                            <span className={cn("transition-transform duration-200", !isActive && "group-hover:rotate-6")}>
                                {item.icon}
                            </span>
                            {(!isCollapsed || isMobileOpen) && (
                                <span className="font-mono text-[13px] uppercase tracking-wider">{item.name}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Expandable area (only visible when collapsed on desktop) */}
            {isCollapsed && !isMobileOpen && (
                <div
                    onClick={() => onCollapsedChange(false)}
                    className="flex-1 cursor-ew-resize transition-colors flex items-center justify-center group hidden lg:flex"
                    title="Click to expand sidebar"
                >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Spacer when not collapsed or on mobile */}
            {(!isCollapsed || isMobileOpen) && <div className="flex-1" />}

            {/* Expand Button - Only when collapsed on desktop */}
            {isCollapsed && !isMobileOpen && (
                <div className="px-3 pb-2 flex-shrink-0 hidden lg:block">
                    <button
                        onClick={() => onCollapsedChange(false)}
                        className={cn(
                            "w-full flex items-center justify-center py-2.5 rounded-xl",
                            "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]",
                            "hover:bg-[var(--bg-tertiary)] transition-all duration-200"
                        )}
                        title="Expand sidebar"
                    >
                        <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                </div>
            )}

            {/* User Section - Fixed at bottom */}
            <div className="p-2 border-t border-[var(--border-primary)] flex-shrink-0 relative" ref={menuRef}>
                {/* Profile Button */}
                <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                        "hover:bg-[var(--bg-tertiary)] transition-all duration-200",
                        isCollapsed && !isMobileOpen && "justify-center px-0"
                    )}
                >
                    <div className="w-9 h-9 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-[var(--text-secondary)] font-mono">
                            {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
                        </span>
                    </div>
                    {(!isCollapsed || isMobileOpen) && (
                        <>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                    {session?.user?.name || "User"}
                                </p>
                                <p className="text-[11px] text-[var(--text-tertiary)] truncate font-mono">
                                    {session?.user?.email}
                                </p>
                            </div>
                            <svg
                                className={cn(
                                    "w-4 h-4 text-[var(--text-tertiary)] transition-transform duration-200",
                                    isProfileMenuOpen && "rotate-180"
                                )}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </>
                    )}
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                    <div
                        className={cn(
                            "absolute bottom-full mb-2 z-[60] glass rounded-xl shadow-lg overflow-hidden animate-slideDown",
                            isCollapsed && !isMobileOpen ? "left-full ml-2 w-48" : "left-3 right-3"
                        )}
                    >
                        {/* Theme Toggle */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log("Theme button clicked, current theme:", theme);
                                toggleTheme();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors font-mono"
                        >
                            {theme === "dark" ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                        </button>

                        {/* Divider */}
                        <div className="border-t border-[var(--border-primary)]" />

                        {/* Help */}
                        <button
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors font-mono"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Help</span>
                        </button>

                        {/* Divider */}
                        <div className="border-t border-[var(--border-primary)]" />

                        {/* Sign Out */}
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--accent-error)] hover:bg-[var(--accent-error)]/10 transition-colors font-mono"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Sign Out</span>
                        </button>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => onMobileOpenChange(false)}
                />
            )}

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-screen z-50",
                    "bg-[var(--bg-secondary)] border-r border-[var(--border-primary)]",
                    "flex-col transition-all duration-300 ease-out",
                    "hidden lg:flex",
                    isCollapsed ? "w-[72px]" : "w-70",
                    // "rounded-r-lg"
                )}
            >
                {sidebarContent(desktopMenuRef)}
            </aside>

            {/* Mobile Drawer */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-screen z-50",
                    "bg-[var(--bg-secondary)] border-r border-[var(--border-primary)]",
                    "flex flex-col transition-transform duration-300 ease-out",
                    "lg:hidden w-72",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {sidebarContent(mobileMenuRef)}
            </aside>
        </>
    );
}

// Mobile Header with hamburger menu
export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] z-30 flex items-center px-4 lg:hidden">
            <button
                onClick={onMenuClick}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </button>
            <Link href="/apps" className="flex items-center gap-2 ml-3">
                <div className="w-8 h-8 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center">
                    <span className="text-[var(--text-inverted)] font-bold text-xs font-mono">S</span>
                </div>
                <span className="font-mono font-medium text-[var(--text-primary)] text-lg">Supetron</span>
            </Link>
        </header>
    );
}
