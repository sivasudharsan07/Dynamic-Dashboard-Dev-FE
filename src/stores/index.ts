import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, TenantContext, TenantRole } from '@/types';

// ---- Session Store ----
type SessionStore = {
  session: Session | null;
  setSession: (s: Session) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      session: null,
      setSession: (s) => set({ session: s }),
      clearSession: () => set({ session: null }),
    }),
    { name: 'dd-session' }
  )
);

// ---- Tenant Store ----
type TenantStore = {
  tenant: TenantContext | null;
  setTenant: (t: TenantContext) => void;
  clearTenant: () => void;
};

export const useTenantStore = create<TenantStore>()((set) => ({
  tenant: null,
  setTenant: (t) => set({ tenant: t }),
  clearTenant: () => set({ tenant: null }),
}));

// ---- Theme Store ----
type ThemeStore = {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  toggle: () => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (t) => {
        set({ theme: t });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', t);
        }
      },
      toggle: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: next });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', next);
        }
      },
    }),
    { name: 'dd-theme' }
  )
);

// ---- Dashboard Store ----
import type { DashboardWidget } from '@/types';

type DashboardStore = {
  dashboardName: string;
  widgets: DashboardWidget[];
  setDashboardName: (n: string) => void;
  setWidgets: (w: DashboardWidget[]) => void;
  addWidget: (w: DashboardWidget) => void;
  updateWidget: (id: string, patch: Partial<DashboardWidget>) => void;
  removeWidget: (id: string) => void;
  clearDashboard: () => void;
};

export const useDashboardStore = create<DashboardStore>()((set) => ({
  dashboardName: 'My Dashboard',
  widgets: [],
  setDashboardName: (n) => set({ dashboardName: n }),
  setWidgets: (w) => set({ widgets: w }),
  addWidget: (w) => set((s) => ({ widgets: [...s.widgets, w] })),
  updateWidget: (id, patch) =>
    set((s) => ({ widgets: s.widgets.map((w) => (w.id === id ? { ...w, ...patch } : w)) })),
  removeWidget: (id) => set((s) => ({ widgets: s.widgets.filter((w) => w.id !== id) })),
  clearDashboard: () => set({ widgets: [] }),
}));

// ---- Chat Store ----
import type { ChatThread, ChatMessage } from '@/types';

type ChatStore = {
  thread: ChatThread | null;
  initThread: (id: string) => void;
  addMessage: (msg: ChatMessage) => void;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  clearThread: () => void;
};

export const useChatStore = create<ChatStore>()((set) => ({
  thread: null,
  initThread: (id) => set({ thread: { id, messages: [] } }),
  addMessage: (msg) =>
    set((s) => s.thread ? { thread: { ...s.thread, messages: [...s.thread.messages, msg] } } : s),
  updateMessage: (id, patch) =>
    set((s) =>
      s.thread
        ? { thread: { ...s.thread, messages: s.thread.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) } }
        : s
    ),
  clearThread: () => set({ thread: null }),
}));

// ---- Agent Logs Store ----
import type { AgentLogEntry } from '@/types';

type AgentLogsStore = {
  logs: AgentLogEntry[];
  addLog: (e: AgentLogEntry) => void;
  clearLogs: () => void;
};

export const useAgentLogsStore = create<AgentLogsStore>()((set) => ({
  logs: [],
  addLog: (e) => set((s) => ({ logs: [...s.logs, e] })),
  clearLogs: () => set({ logs: [] }),
}));

// ---- Logout helper ----
export function logoutAll() {
  useSessionStore.getState().clearSession();
  useTenantStore.getState().clearTenant();
  useChatStore.getState().clearThread();
  useDashboardStore.getState().clearDashboard();
  useAgentLogsStore.getState().clearLogs();
}
