"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                router.push("/apps");
                router.refresh();
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] dot-grid flex flex-col">
            {/* Header */}
            <header className="p-6">
                <Link href="/" className="inline-flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-[var(--accent-primary)] rounded-xl flex items-center justify-center">
                        <span className="text-[var(--text-inverted)] font-bold text-sm font-mono">S</span>
                    </div>
                    <span className="font-mono font-medium text-[var(--text-primary)]">Supetron</span>
                </Link>
            </header>

            {/* Main */}
            <main className="flex-1 flex items-center justify-center px-6 pb-20">
                <div className="w-full max-w-sm animate-fadeInUp">
                    {/* Glass Card Container */}
                    <div className="glass rounded-2xl p-8">
                        {/* Title */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-light mb-2">Welcome back</h1>
                            <p className="text-[var(--text-secondary)] text-sm font-mono">
                                Sign in to continue building
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
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
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />

                            {error && (
                                <div className="p-3 rounded-xl bg-[var(--accent-error)]/10 border border-[var(--accent-error)]/20">
                                    <p className="text-sm text-[var(--accent-error)] font-mono">{error}</p>
                                </div>
                            )}

                            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                                Sign In
                            </Button>
                        </form>

                        {/* Footer */}
                        <p className="text-center text-[var(--text-secondary)] text-sm mt-6 font-mono">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="text-[var(--accent-primary)] hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
