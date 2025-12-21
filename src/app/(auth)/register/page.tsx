"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

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
                            <h1 className="text-2xl font-light mb-2">Create an account</h1>
                            <p className="text-[var(--text-secondary)] text-sm font-mono">
                                Start building AI-powered apps
                            </p>
                        </div>

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
