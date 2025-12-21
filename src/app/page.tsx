"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-primary)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center">
              <span className="text-[var(--text-inverted)] font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-[var(--text-primary)]">Supetron</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className={`max-w-3xl mx-auto text-center ${mounted ? 'animate-slideUp' : 'opacity-0'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full"></span>
            <span className="text-[13px] text-[var(--text-secondary)]">AI-Powered No-Code Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-[3.5rem] leading-[1.1] font-bold tracking-tight mb-6">
            Build AI Apps
            <br />
            <span className="text-[var(--accent-primary)]">With Just Words</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed">
            Create powerful micro-apps using natural language.
            Track expenses, automate tasks, generate content — no coding required.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg">
                Start Building Free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Button variant="secondary" size="lg">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Demo Preview */}
        <div className={`max-w-4xl mx-auto mt-20 ${mounted ? 'animate-slideUp' : 'opacity-0'}`} style={{ animationDelay: '150ms' }}>
          <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-1">
            <div className="bg-[var(--bg-primary)] rounded-xl aspect-[16/9] flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-[var(--text-tertiary)] text-sm">App Preview Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-24 px-6 border-t border-[var(--border-primary)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-semibold mb-3">Everything You Need</h2>
            <p className="text-[var(--text-secondary)]">Build any app with the power of AI</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6 transition-all duration-200 hover:border-[var(--border-secondary)]">
              <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Natural Language</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Describe what you want. Our AI understands your intent and builds the app.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6 transition-all duration-200 hover:border-[var(--border-secondary)]">
              <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Connect Services</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Gmail, Notion, Calendars, REST APIs — integrate with your favorite tools.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6 transition-all duration-200 hover:border-[var(--border-secondary)]">
              <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Store Your Data</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Each app stores its own data — expenses, notes, habits, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[var(--border-primary)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[var(--accent-primary)] rounded-md flex items-center justify-center">
              <span className="text-[var(--text-inverted)] font-bold text-xs">S</span>
            </div>
            <span className="font-medium text-sm">Supetron</span>
          </div>
          <p className="text-sm text-[var(--text-tertiary)]">
            © 2024 Supetron. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
