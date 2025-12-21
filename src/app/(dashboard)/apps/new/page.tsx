"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewAppRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/builder");
    }, [router]);

    return (
        <div className="h-screen flex items-center justify-center">
            <div className="flex items-center gap-3">
                <svg className="w-5 h-5 animate-spin text-[var(--text-tertiary)]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-[var(--text-tertiary)] font-mono text-sm">Redirecting to App Builder...</span>
            </div>
        </div>
    );
}
