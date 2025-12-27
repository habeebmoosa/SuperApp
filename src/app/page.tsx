"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// DEMO APP TYPES
// ============================================

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
}

// ============================================
// DEMO TODO APP
// ============================================

function TodoDemo() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", text: "Try SuperApp Builder", completed: true, priority: "high" },
    { id: "2", text: "Create my first AI app", completed: false, priority: "high" },
    { id: "3", text: "Share with friends", completed: false, priority: "medium" },
  ]);
  const [newTodo, setNewTodo] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos([
      ...todos,
      { id: Date.now().toString(), text: newTodo.trim(), completed: false, priority },
    ]);
    setNewTodo("");
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const priorityColors = {
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a task..."
          className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)]"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
          className="px-2 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs"
        >
          <option value="high">🔴</option>
          <option value="medium">🟡</option>
          <option value="low">🟢</option>
        </select>
        <button
          onClick={addTodo}
          className="px-3 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:opacity-90"
        >
          +
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
        <AnimatePresence>
          {todos.map((todo) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className={`flex items-center gap-3 p-3 rounded-xl border ${todo.completed ? "bg-[var(--bg-tertiary)]/50 opacity-60" : "bg-[var(--bg-tertiary)]"
                } border-[var(--border-primary)]`}
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${todo.completed
                    ? "bg-[var(--accent-primary)] border-[var(--accent-primary)]"
                    : "border-[var(--text-tertiary)]"
                  }`}
              >
                {todo.completed && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className={`flex-1 text-sm ${todo.completed ? "line-through" : ""}`}>{todo.text}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${priorityColors[todo.priority]}`}>
                {todo.priority}
              </span>
              <button onClick={() => deleteTodo(todo.id)} className="text-[var(--text-tertiary)] hover:text-red-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--border-primary)] flex justify-between text-xs text-[var(--text-tertiary)]">
        <span>{todos.filter((t) => !t.completed).length} remaining</span>
        <span>{todos.filter((t) => t.completed).length} completed</span>
      </div>
    </div>
  );
}

// ============================================
// DEMO EXPENSE TRACKER APP
// ============================================

function ExpenseDemo() {
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "1", amount: 45.99, category: "food", description: "Groceries", date: "2024-12-27" },
    { id: "2", amount: 12.50, category: "transport", description: "Uber ride", date: "2024-12-27" },
    { id: "3", amount: 89.00, category: "shopping", description: "New shoes", date: "2024-12-26" },
  ]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [description, setDescription] = useState("");

  const addExpense = () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    setExpenses([
      { id: Date.now().toString(), amount: parseFloat(amount), category, description, date: new Date().toISOString().split("T")[0] },
      ...expenses,
    ]);
    setAmount("");
    setDescription("");
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryIcons: Record<string, string> = { food: "🍔", transport: "🚗", shopping: "🛍️", entertainment: "🎬", other: "📦" };
  const categoryColors: Record<string, string> = {
    food: "bg-orange-500/20 text-orange-400",
    transport: "bg-blue-500/20 text-blue-400",
    shopping: "bg-pink-500/20 text-pink-400",
    entertainment: "bg-purple-500/20 text-purple-400",
    other: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="h-full flex flex-col">
      <div className="glass rounded-xl p-4 mb-4">
        <p className="text-xs text-[var(--text-tertiary)] font-mono mb-1">TOTAL SPENT</p>
        <p className="text-2xl font-light">${total.toFixed(2)}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm"
        >
          <option value="food">🍔 Food</option>
          <option value="transport">🚗 Transport</option>
          <option value="shopping">🛍️ Shopping</option>
          <option value="entertainment">🎬 Fun</option>
          <option value="other">📦 Other</option>
        </select>
      </div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addExpense()}
          placeholder="Description"
          className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm"
        />
        <button onClick={addExpense} className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium">
          Add
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
        {expenses.slice(0, 5).map((expense) => (
          <div key={expense.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${categoryColors[expense.category]}`}>
              {categoryIcons[expense.category]}
            </div>
            <div className="flex-1">
              <p className="text-sm">{expense.description || expense.category}</p>
              <p className="text-xs text-[var(--text-tertiary)]">{expense.date}</p>
            </div>
            <p className="font-mono text-sm">-${expense.amount.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// DEMO NOTES APP
// ============================================

function NotesDemo() {
  const [notes, setNotes] = useState<Note[]>([
    { id: "1", title: "Welcome! 👋", content: "This is a demo note. Try adding your own!", color: "#6366f1" },
    { id: "2", title: "Ideas", content: "Build an AI app that...", color: "#ec4899" },
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const colors = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#ef4444"];
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const addNote = () => {
    if (!newTitle.trim()) return;
    setNotes([{ id: Date.now().toString(), title: newTitle, content: newContent, color: selectedColor }, ...notes]);
    setNewTitle("");
    setNewContent("");
  };

  const deleteNote = (id: string) => setNotes(notes.filter((n) => n.id !== id));

  return (
    <div className="h-full flex flex-col">
      <div className="space-y-2 mb-4">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm"
        />
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Content..."
          rows={2}
          className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm resize-none"
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`w-6 h-6 rounded-full transition-transform ${selectedColor === c ? "scale-125 ring-2 ring-white/30" : ""}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button onClick={addNote} className="px-4 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium">
            Add Note
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2">
        {notes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-xl relative group"
            style={{ backgroundColor: `${note.color}20`, borderLeft: `3px solid ${note.color}` }}
          >
            <button
              onClick={() => deleteNote(note.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-tertiary)] hover:text-red-400"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <p className="font-medium text-sm mb-1">{note.title}</p>
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{note.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// DEMO POMODORO TIMER APP
// ============================================

function TimerDemo() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsRunning(false);
          if (mode === "work") {
            setSessions((s) => s + 1);
            setMode("break");
            return 5 * 60;
          } else {
            setMode("work");
            return 25 * 60;
          }
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === "work" ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = mode === "work" ? (25 * 60 - timeLeft) / (25 * 60) : (5 * 60 - timeLeft) / (5 * 60);

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="relative w-40 h-40 mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="80" cy="80" r="70" fill="none" strokeWidth="8" stroke="var(--bg-tertiary)" />
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            strokeWidth="8"
            stroke={mode === "work" ? "var(--accent-primary)" : "#10b981"}
            strokeLinecap="round"
            strokeDasharray={440}
            strokeDashoffset={440 * (1 - progress)}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-mono font-light">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className={`text-xs font-mono uppercase ${mode === "work" ? "text-[var(--accent-primary)]" : "text-green-400"}`}>
            {mode}
          </span>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={toggleTimer}
          className={`px-6 py-2 rounded-xl font-medium text-sm ${isRunning ? "bg-[var(--bg-tertiary)] border border-[var(--border-primary)]" : "bg-[var(--accent-primary)] text-white"
            }`}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button onClick={resetTimer} className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm">
          Reset
        </button>
      </div>
      <div className="mt-6 text-center">
        <p className="text-xs text-[var(--text-tertiary)] font-mono">Sessions completed</p>
        <p className="text-2xl font-light">{sessions}</p>
      </div>
    </div>
  );
}

// ============================================
// DEMO APP CARD WRAPPER
// ============================================

interface DemoAppCardProps {
  title: string;
  icon: string;
  description: string;
  children: React.ReactNode;
  gradient: string;
}

function DemoAppCard({ title, icon, description, children, gradient }: DemoAppCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <div className={`px-5 py-4 ${gradient}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-medium text-white">{title}</h3>
            <p className="text-xs text-white/70">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-4 h-80">{children}</div>
    </motion.div>
  );
}

// ============================================
// MAIN LANDING PAGE
// ============================================

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--glass-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--accent-primary)] rounded-xl flex items-center justify-center">
              <span className="text-[var(--text-inverted)] font-bold text-xs sm:text-sm font-mono">S</span>
            </div>
            <span className="font-mono font-medium text-[var(--text-primary)] tracking-tight text-lg sm:text-base">SuperApp</span>
          </Link>
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
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
        {isMobileMenuOpen && (
          <div className="sm:hidden glass border-t border-[var(--glass-border)]">
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
      <main className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 dot-grid">
        <div className={`max-w-4xl mx-auto text-center ${mounted ? "animate-fadeInUp" : "opacity-0"}`}>
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 glass rounded-full mb-6 sm:mb-10">
            <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-pulse" />
            <span className="text-[11px] sm:text-[13px] font-mono text-[var(--text-secondary)] uppercase tracking-wider">
              AI-Powered App Builder
            </span>
          </div>
          <h1 className="text-[2.5rem] sm:text-[4rem] md:text-[5rem] leading-[1.1] sm:leading-[1.05] font-light tracking-tight mb-6 sm:mb-8">
            Build AI Apps
            <br />
            <span className="text-[var(--accent-primary)]">With Just Words</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed font-light px-2">
            Create powerful micro-apps using natural language. Track expenses, manage todos, take notes — no coding required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="animate-glow w-full sm:w-auto">
                Start Building Free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Link href="#demos" className="w-full sm:w-auto">
              <Button variant="glass" size="lg" className="w-full sm:w-auto">
                See Examples
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Interactive Demo Apps Section */}
      <section id="demos" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-[var(--border-primary)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-4"
            >
              <span className="text-xl">⚡</span>
              <span className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">Live Demos</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-light mb-3 sm:mb-4"
            >
              Try These <span className="text-[var(--accent-primary)]">Working Apps</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-[var(--text-secondary)] font-light text-base sm:text-lg max-w-xl mx-auto"
            >
              These are fully functional apps running in your browser. All built with SuperApp&apos;s AI — no code required.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <DemoAppCard
              title="Todo List"
              icon="✅"
              description="Organize tasks with priorities"
              gradient="bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              <TodoDemo />
            </DemoAppCard>
            <DemoAppCard
              title="Expense Tracker"
              icon="💰"
              description="Track your spending"
              gradient="bg-gradient-to-r from-emerald-600 to-teal-600"
            >
              <ExpenseDemo />
            </DemoAppCard>
            <DemoAppCard
              title="Quick Notes"
              icon="📝"
              description="Capture ideas instantly"
              gradient="bg-gradient-to-r from-pink-600 to-rose-600"
            >
              <NotesDemo />
            </DemoAppCard>
            <DemoAppCard
              title="Pomodoro Timer"
              icon="⏱️"
              description="Stay focused and productive"
              gradient="bg-gradient-to-r from-orange-600 to-amber-600"
            >
              <TimerDemo />
            </DemoAppCard>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-sm text-[var(--text-tertiary)] mb-4">
              ✨ These demos run entirely in your browser. Data resets on refresh.
            </p>
            <Link href="/register">
              <Button size="lg">
                Build Your Own App
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-[var(--border-primary)] dot-grid">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-3 sm:mb-4">How It Works</h2>
            <p className="text-[var(--text-secondary)] font-light text-base sm:text-lg">Three simple steps to your custom app</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Describe", desc: "Tell the AI what you want in plain English", icon: "💬" },
              { step: "02", title: "Generate", desc: "AI creates your app instantly with working code", icon: "⚡" },
              { step: "03", title: "Use", desc: "Run your app immediately, store real data", icon: "🚀" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 text-center relative overflow-hidden group hover:scale-[1.02] transition-transform"
              >
                <div className="absolute -top-4 -right-4 text-6xl font-mono font-bold text-[var(--accent-primary)]/10">{item.step}</div>
                <span className="text-4xl mb-4 block">{item.icon}</span>
                <h3 className="font-medium text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-[var(--border-primary)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass rounded-3xl p-8 sm:p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/10 to-transparent" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-4">Ready to Build?</h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
              Join thousands of creators building apps without code. Start free today.
            </p>
            <Link href="/register">
              <Button size="lg" className="animate-glow">
                Get Started — It&apos;s Free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
          </div>
        </motion.div>
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
          <p className="text-xs sm:text-sm text-[var(--text-tertiary)] font-mono">© 2024 SuperApp</p>
        </div>
      </footer>
    </div>
  );
}
