import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppConfig } from "@/schemas/app-config";

interface App {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    status: "DRAFT" | "ACTIVE" | "ARCHIVED";
    appConfig: AppConfig;
    createdAt: string;
    updatedAt: string;
}

interface AppState {
    apps: App[];
    currentApp: App | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setApps: (apps: App[]) => void;
    setCurrentApp: (app: App | null) => void;
    addApp: (app: App) => void;
    updateApp: (id: string, updates: Partial<App>) => void;
    removeApp: (id: string) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

const initialState = {
    apps: [],
    currentApp: null,
    isLoading: false,
    error: null,
};

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            ...initialState,

            setApps: (apps) => set({ apps }),

            setCurrentApp: (app) => set({ currentApp: app }),

            addApp: (app) => set((state) => ({ apps: [...state.apps, app] })),

            updateApp: (id, updates) =>
                set((state) => ({
                    apps: state.apps.map((app) =>
                        app.id === id ? { ...app, ...updates } : app
                    ),
                    currentApp:
                        state.currentApp?.id === id
                            ? { ...state.currentApp, ...updates }
                            : state.currentApp,
                })),

            removeApp: (id) =>
                set((state) => ({
                    apps: state.apps.filter((app) => app.id !== id),
                    currentApp: state.currentApp?.id === id ? null : state.currentApp,
                })),

            setLoading: (isLoading) => set({ isLoading }),

            setError: (error) => set({ error }),

            reset: () => set(initialState),
        }),
        {
            name: "superapp-apps",
            partialize: (state) => ({ apps: state.apps }),
        }
    )
);
