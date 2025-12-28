"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";

interface OAuthProviders {
    google: boolean;
}

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState("");
    const [providers, setProviders] = useState<OAuthProviders>({ google: false });
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    // Fetch available OAuth providers on mount
    useEffect(() => {
        fetch("/api/auth/providers")
            .then((res) => res.json())
            .then((data) => setProviders(data))
            .catch(() => { });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed");
                return;
            }

            router.push("/login?registered=true");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        setError("");
        try {
            await signIn("google", { callbackUrl: "/apps" });
        } catch {
            setError("Failed to sign in with Google");
            setIsGoogleLoading(false);
        }
    };

    const hasOAuth = providers.google;

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] dot-grid flex flex-col">
            {/* Header */}
            <header className="p-6">
                <Link href="/" className="inline-flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-[var(--accent-primary)] rounded-xl flex items-center justify-center">
                        <span className="text-[var(--text-inverted)] font-bold text-sm font-mono">S</span>
                    </div>
                    <span className="font-mono font-medium text-[var(--text-primary)]">SuperApp</span>
                </Link>
            </header>

            {/* Main */}
            <main className="flex-1 flex items-center justify-center px-6 pb-20">
                <div className="w-full max-w-sm animate-fadeInUp">
                    {/* Glass Card Container */}
                    <div className="glass rounded-2xl p-8">
                        {/* Title */}
                        <div className="text-center mb-8">
                            <h1 className="text-xl font-light mb-2">Create an account</h1>
                            <p className="text-[var(--text-secondary)] text-sm font-mono">
                                Start building AI-powered apps
                            </p>
                        </div>

                        {/* OAuth Buttons */}
                        {hasOAuth && (
                            <>
                                {providers.google && (
                                    <button
                                        onClick={handleGoogleSignIn}
                                        disabled={isGoogleLoading}
                                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gray-200 text-gray-800 font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGoogleLoading ? (
                                            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path
                                                    fill="#4285F4"
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                />
                                                <path
                                                    fill="#34A853"
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                />
                                                <path
                                                    fill="#FBBC05"
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                />
                                                <path
                                                    fill="#EA4335"
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                />
                                            </svg>
                                        )}
                                        Continue with Google
                                    </button>
                                )}

                                {/* Divider */}
                                <div className="flex items-center gap-4 my-6">
                                    <div className="flex-1 h-px bg-[var(--border-primary)]" />
                                    <span className="text-xs text-[var(--text-tertiary)] font-mono uppercase">or</span>
                                    <div className="flex-1 h-px bg-[var(--border-primary)]" />
                                </div>
                            </>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Name"
                                type="text"
                                placeholder="Your name"
                                value={formData.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />

                            <Input
                                label="Email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                                required
                                mono
                            />

                            <Input
                                label="Password"
                                type="password"
                                placeholder="Create a password"
                                helperText="At least 8 characters"
                                value={formData.password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />

                            {error && (
                                <div className="p-3 rounded-xl bg-[var(--accent-error)]/10 border border-[var(--accent-error)]/20">
                                    <p className="text-sm text-[var(--accent-error)] font-mono">{error}</p>
                                </div>
                            )}

                            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                                Create Account
                            </Button>
                        </form>

                        {/* Footer */}
                        <p className="text-center text-[var(--text-secondary)] text-sm mt-6 font-mono">
                            Already have an account?{" "}
                            <Link href="/login" className="text-[var(--accent-primary)] hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
