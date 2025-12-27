"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] dot-grid">
      {/* Navigation - Glass Style */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--glass-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--accent-primary)] rounded-xl flex items-center justify-center">
              <span className="text-[var(--text-inverted)] font-bold text-xs sm:text-sm font-mono">S</span>
            </div>
            <span className="font-mono font-medium text-[var(--text-primary)] tracking-tight text-lg sm:text-base">
              SuperApp
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden h-10 w-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden glass border-t border-[var(--glass-border)] animate-slideDown">
            <div className="p-4 space-y-3">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" fullWidth>Sign in</Button>
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button fullWidth>Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className={`max-w-4xl mx-auto text-center ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 glass rounded-full mb-6 sm:mb-10">
            <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-pulse" />
            <span className="text-[11px] sm:text-[13px] font-mono text-[var(--text-secondary)] uppercase tracking-wider">
              AI-Powered App Builder
            </span>
          </div>

          {/* Headline - Responsive sizing */}
          <h1 className="text-[2.5rem] sm:text-[4rem] md:text-[5rem] leading-[1.1] sm:leading-[1.05] font-light tracking-tight mb-6 sm:mb-8">
            Build AI Apps
            <br />
            <span className="text-[var(--accent-primary)]">With Just Words</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed font-light px-2">
            Create powerful micro-apps using natural language.
            Track expenses, automate tasks, generate content — no coding required.
          </p>

          {/* CTA Buttons - Stack on mobile */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="animate-glow w-full sm:w-auto">
                Start Building Free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Button variant="glass" size="lg" className="w-full sm:w-auto">
              Watch Demo
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Demo Preview */}
        <div
          className={`max-w-5xl mx-auto mt-12 sm:mt-24 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}
          style={{ animationDelay: '200ms' }}
        >
          <div className="relative glass rounded-2xl sm:rounded-3xl p-1.5 sm:p-2">
            <div className="bg-[var(--bg-primary)] rounded-xl sm:rounded-2xl aspect-[4/3] sm:aspect-[16/9] flex items-center justify-center dot-grid">
              <div className="text-center px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 glass rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-[var(--text-tertiary)] text-xs sm:text-sm font-mono uppercase tracking-wider">
                  App Preview Coming Soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 sm:py-32 px-4 sm:px-6 border-t border-[var(--border-primary)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-3 sm:mb-4">Everything You Need</h2>
            <p className="text-[var(--text-secondary)] font-light text-base sm:text-lg">Build any app with the power of AI</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Feature 1 */}
            <div className="glass rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--accent-primary)]/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-5">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-medium text-base sm:text-lg mb-2">Natural Language</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Describe what you want. Our AI understands your intent and builds the app.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--accent-primary)]/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-5">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="font-medium text-base sm:text-lg mb-2">Connect Services</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Gmail, Notion, Calendars, REST APIs — integrate with your favorite tools.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--accent-primary)]/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-5">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="font-medium text-base sm:text-lg mb-2">Store Your Data</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Each app stores its own data — expenses, notes, habits, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-[var(--border-primary)]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center">
              <span className="text-[var(--text-inverted)] font-bold text-[10px] sm:text-xs font-mono">S</span>
            </div>
            <span className="font-mono font-medium text-sm">SuperApp</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-tertiary)] font-mono">
            © 2024 SuperApp
          </p>
        </div>
      </footer>
    </div>
  );
}
