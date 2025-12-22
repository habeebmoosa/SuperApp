/**
 * Pre-built App Templates
 * Reliable, tested templates for common app types
 */

export interface AppTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    keywords: string[]; // For matching user prompts
    inputs: Array<{
        id: string;
        type: string;
        label: string;
        placeholder?: string;
        required?: boolean;
        options?: Array<{ label: string; value: string }>;
        helpText?: string;
    }>;
    outputs: Array<{
        id: string;
        type: string;
        label?: string;
        source: string;
    }>;
    code: string; // Clean, working JavaScript
    dataTypes: string[]; // What data types this app stores
}

/**
 * Expense Tracker Template
 */
export const EXPENSE_TRACKER: AppTemplate = {
    id: "expense-tracker",
    name: "Expense Tracker",
    description: "Track daily expenses and view spending summaries by category",
    icon: "💰",
    category: "finance",
    keywords: ["expense", "spending", "money", "budget", "finance", "track expenses", "cost"],
    inputs: [
        {
            id: "amount",
            type: "number",
            label: "Amount ($)",
            placeholder: "0.00",
            required: true,
            helpText: "Enter the expense amount",
        },
        {
            id: "category",
            type: "select",
            label: "Category",
            options: [
                { label: "Food & Dining", value: "food" },
                { label: "Transportation", value: "transport" },
                { label: "Shopping", value: "shopping" },
                { label: "Bills & Utilities", value: "bills" },
                { label: "Entertainment", value: "entertainment" },
                { label: "Health", value: "health" },
                { label: "Other", value: "other" },
            ],
        },
        {
            id: "description",
            type: "text",
            label: "Description",
            placeholder: "What was this expense for?",
        },
    ],
    outputs: [
        { id: "message", type: "text", label: "Status", source: "{{message}}" },
        { id: "total", type: "card", label: "Summary", source: "Total: {{totalExpenses}} ({{expenseCount}} expenses)" },
        { id: "recent", type: "table", label: "Recent Expenses", source: "{{recentExpenses}}" },
    ],
    dataTypes: ["expense"],
    code: `async function run(inputs, helpers) {
    const { amount, category, description } = inputs;
    
    // Save new expense if amount provided
    if (amount && amount > 0) {
        await helpers.db.store('expense', {
            amount: amount,
            category: category || 'other',
            description: description || '',
            date: new Date().toISOString()
        });
    }
    
    // Get all expenses
    const expenses = await helpers.db.getAll('expense');
    
    // Calculate totals
    const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    
    // Get recent expenses for display
    const recentExpenses = expenses.slice(0, 10).map(e => ({
        Amount: helpers.utils.formatCurrency(e.amount),
        Category: e.category,
        Description: e.description || '-',
        Date: helpers.utils.formatDate(new Date(e.date))
    }));
    
    return {
        message: amount ? 'Expense added successfully!' : 'Here are your expenses',
        totalExpenses: helpers.utils.formatCurrency(total),
        expenseCount: expenses.length,
        recentExpenses: recentExpenses
    };
}`,
};

/**
 * Todo List Template
 */
export const TODO_LIST: AppTemplate = {
    id: "todo-list",
    name: "Todo List",
    description: "Manage your tasks with priorities and completion status",
    icon: "✅",
    category: "productivity",
    keywords: ["todo", "task", "tasks", "checklist", "to do", "to-do", "list"],
    inputs: [
        {
            id: "task",
            type: "text",
            label: "New Task",
            placeholder: "What needs to be done?",
        },
        {
            id: "priority",
            type: "select",
            label: "Priority",
            options: [
                { label: "🔴 High", value: "high" },
                { label: "🟡 Medium", value: "medium" },
                { label: "🟢 Low", value: "low" },
            ],
        },
    ],
    outputs: [
        { id: "message", type: "text", source: "{{message}}" },
        { id: "stats", type: "card", label: "Progress", source: "{{pendingCount}} pending, {{completedCount}} completed" },
        { id: "tasks", type: "table", label: "Pending Tasks", source: "{{pendingTasks}}" },
    ],
    dataTypes: ["todo"],
    code: `async function run(inputs, helpers) {
    const { task, priority } = inputs;
    
    // Add new task if provided
    if (task && task.trim()) {
        await helpers.db.store('todo', {
            task: task.trim(),
            priority: priority || 'medium',
            completed: false,
            createdAt: new Date().toISOString()
        });
    }
    
    // Get all todos
    const todos = await helpers.db.getAll('todo');
    const pending = todos.filter(t => !t.completed);
    const completed = todos.filter(t => t.completed);
    
    // Format for display
    const pendingTasks = pending.map(t => ({
        Task: t.task,
        Priority: t.priority === 'high' ? '🔴 High' : t.priority === 'low' ? '🟢 Low' : '🟡 Medium',
        Created: helpers.utils.formatDate(new Date(t.createdAt))
    }));
    
    return {
        message: task ? 'Task added!' : 'Your tasks',
        pendingCount: pending.length,
        completedCount: completed.length,
        pendingTasks: pendingTasks
    };
}`,
};

/**
 * Habit Tracker Template
 */
export const HABIT_TRACKER: AppTemplate = {
    id: "habit-tracker",
    name: "Habit Tracker",
    description: "Build positive habits by tracking your daily activities",
    icon: "📈",
    category: "lifestyle",
    keywords: ["habit", "habits", "daily", "routine", "streak", "track habit", "goal"],
    inputs: [
        {
            id: "habit",
            type: "text",
            label: "Habit Name",
            placeholder: "e.g., Exercise, Read, Meditate",
        },
        {
            id: "completed",
            type: "checkbox",
            label: "Completed Today",
        },
    ],
    outputs: [
        { id: "message", type: "text", source: "{{message}}" },
        { id: "stats", type: "card", label: "Today's Progress", source: "{{completedToday}}/{{totalHabits}} habits completed today" },
        { id: "habits", type: "table", label: "Your Habits", source: "{{habitList}}" },
    ],
    dataTypes: ["habit", "habit_log"],
    code: `async function run(inputs, helpers) {
    const { habit, completed } = inputs;
    const today = new Date().toISOString().split('T')[0];
    
    // Add new habit or log completion
    if (habit && habit.trim()) {
        // Check if habit exists
        const habits = await helpers.db.getAll('habit');
        const existingHabit = habits.find(h => h.name.toLowerCase() === habit.trim().toLowerCase());
        
        if (!existingHabit) {
            // Create new habit
            await helpers.db.store('habit', {
                name: habit.trim(),
                createdAt: new Date().toISOString()
            });
        }
        
        if (completed) {
            // Log completion
            await helpers.db.store('habit_log', {
                habit: habit.trim(),
                date: today,
                completedAt: new Date().toISOString()
            });
        }
    }
    
    // Get all habits and today's logs
    const habits = await helpers.db.getAll('habit');
    const logs = await helpers.db.getAll('habit_log');
    const todayLogs = logs.filter(l => l.date === today);
    
    // Build habit list with status
    const habitList = habits.map(h => ({
        Habit: h.name,
        Status: todayLogs.some(l => l.habit === h.name) ? '✅ Done' : '⬜ Not done',
        'Started On': helpers.utils.formatDate(new Date(h.createdAt))
    }));
    
    return {
        message: habit ? (completed ? 'Habit logged!' : 'Habit added!') : 'Your habits',
        completedToday: todayLogs.length,
        totalHabits: habits.length,
        habitList: habitList
    };
}`,
};

/**
 * Note Taking Template
 */
export const NOTE_TAKING: AppTemplate = {
    id: "note-taking",
    name: "Notes",
    description: "Quick note-taking app to capture your thoughts",
    icon: "📝",
    category: "productivity",
    keywords: ["note", "notes", "memo", "write", "jot down", "notebook", "capture"],
    inputs: [
        {
            id: "title",
            type: "text",
            label: "Title",
            placeholder: "Note title",
        },
        {
            id: "content",
            type: "textarea",
            label: "Content",
            placeholder: "Write your note here...",
        },
        {
            id: "category",
            type: "select",
            label: "Category",
            options: [
                { label: "📋 General", value: "general" },
                { label: "💡 Ideas", value: "ideas" },
                { label: "📌 Important", value: "important" },
                { label: "📚 Learning", value: "learning" },
            ],
        },
    ],
    outputs: [
        { id: "message", type: "text", source: "{{message}}" },
        { id: "count", type: "card", label: "Notes", source: "{{noteCount}} notes saved" },
        { id: "notes", type: "table", label: "Recent Notes", source: "{{recentNotes}}" },
    ],
    dataTypes: ["note"],
    code: `async function run(inputs, helpers) {
    const { title, content, category } = inputs;
    
    // Save new note if content provided
    if (content && content.trim()) {
        await helpers.db.store('note', {
            title: title || 'Untitled',
            content: content.trim(),
            category: category || 'general',
            createdAt: new Date().toISOString()
        });
    }
    
    // Get all notes
    const notes = await helpers.db.getAll('note');
    
    // Format for display
    const recentNotes = notes.slice(0, 10).map(n => ({
        Title: n.title,
        Preview: n.content.substring(0, 50) + (n.content.length > 50 ? '...' : ''),
        Category: n.category,
        Date: helpers.utils.formatDate(new Date(n.createdAt))
    }));
    
    return {
        message: content ? 'Note saved!' : 'Your notes',
        noteCount: notes.length,
        recentNotes: recentNotes
    };
}`,
};

/**
 * AI Text Summarizer Template
 */
export const AI_SUMMARIZER: AppTemplate = {
    id: "ai-summarizer",
    name: "Text Summarizer",
    description: "Use AI to summarize long text into concise summaries",
    icon: "🤖",
    category: "ai",
    keywords: ["summarize", "summary", "ai", "tldr", "condense", "shorten", "abstract"],
    inputs: [
        {
            id: "text",
            type: "textarea",
            label: "Text to Summarize",
            placeholder: "Paste your text here...",
            required: true,
        },
        {
            id: "length",
            type: "select",
            label: "Summary Length",
            options: [
                { label: "Brief (1-2 sentences)", value: "brief" },
                { label: "Medium (1 paragraph)", value: "medium" },
                { label: "Detailed (2-3 paragraphs)", value: "detailed" },
            ],
        },
    ],
    outputs: [
        { id: "summary", type: "markdown", label: "Summary", source: "{{summary}}" },
        { id: "stats", type: "text", label: "Stats", source: "Original: {{originalLength}} → Summary: {{summaryLength}} ({{reduction}})" },
    ],
    dataTypes: [],
    code: `async function run(inputs, helpers) {
    const { text, length } = inputs;
    
    if (!text || !text.trim()) {
        return {
            summary: 'Please enter some text to summarize.',
            originalLength: '0 characters',
            summaryLength: '0 characters',
            reduction: 'N/A'
        };
    }
    
    const lengthGuide = {
        brief: '1-2 sentences',
        medium: '1 paragraph',
        detailed: '2-3 paragraphs'
    };
    
    const prompt = 'Summarize the following text in ' + (lengthGuide[length] || '1 paragraph') + ':\\n\\n' + text;
    const summary = await helpers.ai(prompt, 'You are a helpful assistant that summarizes text clearly and concisely.');
    
    const reduction = Math.round((1 - summary.length / text.length) * 100);
    
    return {
        summary: summary,
        originalLength: text.length + ' characters',
        summaryLength: summary.length + ' characters',
        reduction: reduction > 0 ? reduction + '% shorter' : 'Similar length'
    };
}`,
};

/**
 * Bookmark Manager Template
 */
export const BOOKMARK_MANAGER: AppTemplate = {
    id: "bookmark-manager",
    name: "Bookmark Manager",
    description: "Save and organize your favorite links",
    icon: "🔖",
    category: "productivity",
    keywords: ["bookmark", "link", "url", "save link", "favorite", "read later"],
    inputs: [
        {
            id: "url",
            type: "url",
            label: "URL",
            placeholder: "https://example.com",
        },
        {
            id: "title",
            type: "text",
            label: "Title",
            placeholder: "Link title",
        },
        {
            id: "category",
            type: "select",
            label: "Category",
            options: [
                { label: "📚 Read Later", value: "read-later" },
                { label: "💼 Work", value: "work" },
                { label: "🎮 Entertainment", value: "entertainment" },
                { label: "📖 Learning", value: "learning" },
                { label: "🛠 Tools", value: "tools" },
            ],
        },
    ],
    outputs: [
        { id: "message", type: "text", source: "{{message}}" },
        { id: "count", type: "card", label: "Bookmarks", source: "{{bookmarkCount}} bookmarks saved" },
        { id: "bookmarks", type: "table", label: "Recent Bookmarks", source: "{{recentBookmarks}}" },
    ],
    dataTypes: ["bookmark"],
    code: `async function run(inputs, helpers) {
    const { url, title, category } = inputs;
    
    // Save new bookmark if URL provided
    if (url && url.trim()) {
        await helpers.db.store('bookmark', {
            url: url.trim(),
            title: title || url,
            category: category || 'read-later',
            createdAt: new Date().toISOString()
        });
    }
    
    // Get all bookmarks
    const bookmarks = await helpers.db.getAll('bookmark');
    
    // Format for display
    const recentBookmarks = bookmarks.slice(0, 10).map(b => ({
        Title: b.title.substring(0, 40) + (b.title.length > 40 ? '...' : ''),
        Category: b.category,
        Date: helpers.utils.formatDate(new Date(b.createdAt))
    }));
    
    return {
        message: url ? 'Bookmark saved!' : 'Your bookmarks',
        bookmarkCount: bookmarks.length,
        recentBookmarks: recentBookmarks
    };
}`,
};

/**
 * Mood Tracker Template
 */
export const MOOD_TRACKER: AppTemplate = {
    id: "mood-tracker",
    name: "Mood Tracker",
    description: "Track your daily mood and emotions",
    icon: "😊",
    category: "lifestyle",
    keywords: ["mood", "feeling", "emotion", "mental health", "wellbeing", "diary", "journal"],
    inputs: [
        {
            id: "mood",
            type: "select",
            label: "How are you feeling?",
            options: [
                { label: "😄 Great", value: "great" },
                { label: "🙂 Good", value: "good" },
                { label: "😐 Okay", value: "okay" },
                { label: "😔 Not great", value: "not-great" },
                { label: "😢 Bad", value: "bad" },
            ],
            required: true,
        },
        {
            id: "note",
            type: "textarea",
            label: "Notes (optional)",
            placeholder: "What's on your mind?",
        },
    ],
    outputs: [
        { id: "message", type: "text", source: "{{message}}" },
        { id: "streak", type: "card", label: "Tracking", source: "{{daysTracked}} days tracked" },
        { id: "history", type: "table", label: "Recent Entries", source: "{{recentMoods}}" },
    ],
    dataTypes: ["mood"],
    code: `async function run(inputs, helpers) {
    const { mood, note } = inputs;
    
    // Save mood entry
    if (mood) {
        await helpers.db.store('mood', {
            mood: mood,
            note: note || '',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        });
    }
    
    // Get mood history
    const moods = await helpers.db.getAll('mood');
    
    // Get unique days tracked
    const uniqueDays = new Set(moods.map(m => m.date)).size;
    
    // Mood emoji map
    const moodEmoji = {
        'great': '😄',
        'good': '🙂',
        'okay': '😐',
        'not-great': '😔',
        'bad': '😢'
    };
    
    // Format for display
    const recentMoods = moods.slice(0, 7).map(m => ({
        Date: helpers.utils.formatDate(new Date(m.createdAt)),
        Mood: moodEmoji[m.mood] || m.mood,
        Notes: m.note ? m.note.substring(0, 30) + (m.note.length > 30 ? '...' : '') : '-'
    }));
    
    return {
        message: mood ? 'Mood logged!' : 'Your mood history',
        daysTracked: uniqueDays,
        recentMoods: recentMoods
    };
}`,
};

/**
 * Timer/Pomodoro Template
 */
export const POMODORO_TIMER: AppTemplate = {
    id: "pomodoro-timer",
    name: "Focus Session Logger",
    description: "Log your focus/work sessions with duration and notes",
    icon: "⏱️",
    category: "productivity",
    keywords: ["timer", "pomodoro", "focus", "work", "session", "time tracking", "productivity"],
    inputs: [
        {
            id: "duration",
            type: "number",
            label: "Duration (minutes)",
            placeholder: "25",
            required: true,
        },
        {
            id: "activity",
            type: "text",
            label: "What did you work on?",
            placeholder: "e.g., Coding, Writing, Study",
        },
        {
            id: "type",
            type: "select",
            label: "Session Type",
            options: [
                { label: "🎯 Focus", value: "focus" },
                { label: "☕ Break", value: "break" },
                { label: "📚 Study", value: "study" },
                { label: "🏃 Exercise", value: "exercise" },
            ],
        },
    ],
    outputs: [
        { id: "message", type: "text", source: "{{message}}" },
        { id: "stats", type: "card", label: "Today's Focus", source: "{{todayMinutes}} minutes focused today" },
        { id: "sessions", type: "table", label: "Recent Sessions", source: "{{recentSessions}}" },
    ],
    dataTypes: ["session"],
    code: `async function run(inputs, helpers) {
    const { duration, activity, type } = inputs;
    const today = new Date().toISOString().split('T')[0];
    
    // Log new session
    if (duration && duration > 0) {
        await helpers.db.store('session', {
            duration: duration,
            activity: activity || 'Focus session',
            type: type || 'focus',
            date: today,
            createdAt: new Date().toISOString()
        });
    }
    
    // Get all sessions
    const sessions = await helpers.db.getAll('session');
    
    // Calculate today's total
    const todaySessions = sessions.filter(s => s.date === today);
    const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    
    // Type emoji map
    const typeEmoji = {
        'focus': '🎯',
        'break': '☕',
        'study': '📚',
        'exercise': '🏃'
    };
    
    // Format for display
    const recentSessions = sessions.slice(0, 10).map(s => ({
        Activity: s.activity,
        Duration: s.duration + ' min',
        Type: typeEmoji[s.type] || s.type,
        Date: helpers.utils.formatDate(new Date(s.createdAt))
    }));
    
    return {
        message: duration ? 'Session logged!' : 'Your sessions',
        todayMinutes: todayMinutes,
        recentSessions: recentSessions
    };
}`,
};

/**
 * All available templates
 */
export const APP_TEMPLATES: Record<string, AppTemplate> = {
    "expense-tracker": EXPENSE_TRACKER,
    "todo-list": TODO_LIST,
    "habit-tracker": HABIT_TRACKER,
    "note-taking": NOTE_TAKING,
    "ai-summarizer": AI_SUMMARIZER,
    "bookmark-manager": BOOKMARK_MANAGER,
    "mood-tracker": MOOD_TRACKER,
    "pomodoro-timer": POMODORO_TIMER,
};

/**
 * Get template IDs sorted by category
 */
export const TEMPLATES_BY_CATEGORY = {
    productivity: ["todo-list", "note-taking", "bookmark-manager", "pomodoro-timer"],
    finance: ["expense-tracker"],
    lifestyle: ["habit-tracker", "mood-tracker"],
    ai: ["ai-summarizer"],
};

/**
 * Find the best matching template for a user prompt
 */
export function findMatchingTemplate(userPrompt: string): AppTemplate | null {
    const prompt = userPrompt.toLowerCase();

    let bestMatch: AppTemplate | null = null;
    let bestScore = 0;

    for (const template of Object.values(APP_TEMPLATES)) {
        let score = 0;

        // Check keywords
        for (const keyword of template.keywords) {
            if (prompt.includes(keyword.toLowerCase())) {
                score += 10;
            }
        }

        // Check name
        if (prompt.includes(template.name.toLowerCase())) {
            score += 20;
        }

        // Check description words
        const descWords = template.description.toLowerCase().split(" ");
        for (const word of descWords) {
            if (word.length > 3 && prompt.includes(word)) {
                score += 2;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = template;
        }
    }

    // Only return if we have a reasonable match (at least one keyword)
    return bestScore >= 10 ? bestMatch : null;
}

/**
 * Convert template to AppConfig format
 */
export function templateToAppConfig(template: AppTemplate) {
    return {
        version: "1.0" as const,
        metadata: {
            name: template.name,
            description: template.description,
            icon: template.icon,
            category: template.category,
        },
        inputs: template.inputs.map((input) => ({
            id: input.id,
            type: input.type as any,
            label: input.label,
            placeholder: input.placeholder,
            required: input.required,
            options: input.options,
            helpText: input.helpText,
        })),
        outputs: template.outputs.map((output) => ({
            id: output.id,
            type: output.type as any,
            label: output.label,
            source: output.source,
        })),
    };
}
