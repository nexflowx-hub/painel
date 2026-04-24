import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, NexFlowXAPIError } from './api/client';
import type { AuthUser, UserRole } from './api/contracts';

/* ═══════════════════════════════════════════════════════════
   DEV BYPASS — Controlled by NEXT_PUBLIC_ENABLE_DEV_BYPASS
   Disabled by default. Never activates in production.
   When enabled, ANY credentials are accepted (no secrets in bundle).
   ═══════════════════════════════════════════════════════════ */

const DEV_BYPASS_ENABLED =
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_ENABLE_DEV_BYPASS === 'true';

if (DEV_BYPASS_ENABLED) {
  console.warn(
    '[Atlas GP] ⚠️  DEV BYPASS is ACTIVE. Any credentials will be accepted.' +
    ' This mode is disabled in production and must never be committed with NEXT_PUBLIC_ENABLE_DEV_BYPASS=true.'
  );
}

function createBypassUser(username: string): AuthUser {
  return {
    id: 'dev-bypass-001',
    username,
    email: username.includes('@') ? username : `${username}@dev.local`,
    role: 'admin' as UserRole,
    organization_id: 'org-dev-bypass',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  };
}

export const IS_DEV_MODE = DEV_BYPASS_ENABLED;
/* ═══════════════════════════════════════════════════════ */

interface AuthStore {
  isAuthenticated: boolean;
  isLoading: boolean;
  isDevMode: boolean;
  user: AuthUser | null;
  loginError: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  validateToken: () => Promise<void>;
}

export function isAdmin(user: AuthUser | null): boolean { return user?.role === 'admin'; }
export function isMerchant(user: AuthUser | null): boolean { return user?.role === 'merchant'; }
export function isCustomer(user: AuthUser | null): boolean { return user?.role === 'customer'; }
export function getUserRole(user: AuthUser | null): UserRole { return user?.role ?? 'customer'; }

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false, isLoading: false, isDevMode: false, user: null, loginError: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, loginError: null });

        /* ── DEV BYPASS (env-controlled, never in production) ── */
        if (DEV_BYPASS_ENABLED) {
          const bypassUser = createBypassUser(username);
          if (typeof window !== 'undefined') {
            localStorage.setItem('nexflowx_token', 'dev-token-bypass');
            localStorage.setItem('nexflowx_refresh', 'dev-refresh-bypass');
          }
          await new Promise((r) => setTimeout(r, 400)); // simulate latency
          set({ isAuthenticated: true, isDevMode: true, user: bypassUser, loginError: null, isLoading: false });
          return true;
        }
        /* ── END DEV BYPASS ── */

        try {
          const res = await api.auth.login({ username, password });
          set({ isAuthenticated: true, isDevMode: false, user: res.user, loginError: null, isLoading: false });
          return true;
        } catch (err) {
          let message = 'Erro de conexão com o servidor.';
          if (err instanceof NexFlowXAPIError) {
            message = err.status === 401 ? 'Credenciais inválidas. Acesso não autorizado.' : err.message;
          }
          set({ loginError: message, isLoading: false, isAuthenticated: false, user: null, isDevMode: false });
          return false;
        }
      },

      logout: async () => {
        try { await api.auth.logout(); } catch { /* ignore logout API failures */ }
        set({ isAuthenticated: false, user: null, loginError: null, isLoading: false, isDevMode: false });
      },

      validateToken: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('nexflowx_token') : null;
        if (!token) { set({ isAuthenticated: false, user: null }); return; }

        /* ── DEV BYPASS token validation ── */
        if (DEV_BYPASS_ENABLED && token === 'dev-token-bypass') {
          const fallbackUser = createBypassUser('dev@local');
          set({ isAuthenticated: true, isDevMode: true, user: fallbackUser, isLoading: false });
          return;
        }
        /* ── END DEV BYPASS ── */

        set({ isLoading: true });
        try {
          const res = await api.auth.me();
          set({ isAuthenticated: true, isDevMode: false, user: res.user, isLoading: false });
        } catch {
          localStorage.removeItem('nexflowx_token');
          localStorage.removeItem('nexflowx_refresh');
          set({ isAuthenticated: false, user: null, isLoading: false, isDevMode: false });
        }
      },
    }),
    { name: 'nexflowx-auth', partialize: (state) => ({ isAuthenticated: state.isAuthenticated, isDevMode: state.isDevMode, user: state.user }) }
  )
);
