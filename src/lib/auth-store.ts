import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { api } from './api/client';
import type { UserRole } from './api/contracts';

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

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  kyc_level: number;
  organization_id: string;
  webhook_url?: string;
  hmac_secret?: string;
  settings?: {
    email_notifications: boolean;
    transaction_alerts: boolean;
    weekly_reports: boolean;
    security_alerts: boolean;
  };
  created_at: string;
}

function createBypassUser(username: string): AuthUser {
  return {
    id: 'dev-bypass-001',
    username,
    email: username.includes('@') ? username : `${username}@dev.local`,
    role: 'admin' as UserRole,
    kyc_level: 3,
    organization_id: 'org-dev-bypass',
    created_at: new Date().toISOString(),
    settings: {
      email_notifications: true,
      transaction_alerts: true,
      weekly_reports: true,
      security_alerts: true,
    },
  };
}

export const IS_DEV_MODE = DEV_BYPASS_ENABLED;

/* ═══════════════════════════════════════════════════════ */

interface RegisterUserData {
  full_name: string;
  phone: string;
  telegram?: string;
}

interface AuthStore {
  isAuthenticated: boolean;
  isLoading: boolean;
  isDevMode: boolean;
  user: AuthUser | null;
  loginError: string | null;
  registerError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, userData?: RegisterUserData) => Promise<boolean>;
  logout: () => Promise<void>;
  validateToken: () => Promise<void>;
  getSession: () => Promise<void>;
}

export function isAdmin(user: AuthUser | null): boolean { return user?.role === 'admin'; }
export function isMerchant(user: AuthUser | null): boolean { return user?.role === 'merchant'; }
export function isCustomer(user: AuthUser | null): boolean { return user?.role === 'customer'; }
export function getUserRole(user: AuthUser | null): UserRole { return user?.role ?? 'customer'; }

/** Fetch user profile from GET /users/me and map to AuthUser */
async function fetchUserProfile(): Promise<AuthUser | null> {
  try {
    const profile = await api.users.getMe();
    return {
      id: profile.id,
      username: profile.username ?? profile.email,
      email: profile.email,
      role: profile.role,
      kyc_level: profile.kyc_level,
      organization_id: profile.organization_id,
      webhook_url: profile.webhook_url,
      hmac_secret: profile.hmac_secret,
      settings: profile.settings,
      created_at: profile.created_at,
    };
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isLoading: false,
      isDevMode: false,
      user: null,
      loginError: null,
      registerError: null,

      /* ── LOGIN (Supabase signInWithPassword) ── */
      login: async (email: string, password: string) => {
        set({ isLoading: true, loginError: null });

        /* ── DEV BYPASS (env-controlled, never in production) ── */
        if (DEV_BYPASS_ENABLED) {
          const bypassUser = createBypassUser(email);
          await new Promise((r) => setTimeout(r, 400)); // simulate latency
          set({ isAuthenticated: true, isDevMode: true, user: bypassUser, loginError: null, isLoading: false });
          return true;
        }
        /* ── END DEV BYPASS ── */

        try {
          const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
          if (authError) {
            const message = authError.message === 'Invalid login credentials'
              ? 'Credenciais inválidas. Acesso não autorizado.'
              : authError.message;
            set({ loginError: message, isLoading: false, isAuthenticated: false, user: null, isDevMode: false });
            return false;
          }

          // Auth succeeded — fetch user profile from backend
          const profile = await fetchUserProfile();
          if (!profile) {
            set({ loginError: 'Erro ao carregar perfil do utilizador.', isLoading: false, isAuthenticated: false, user: null, isDevMode: false });
            return false;
          }

          set({ isAuthenticated: true, isDevMode: false, user: profile, loginError: null, isLoading: false });
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erro de conexão com o servidor.';
          set({ loginError: message, isLoading: false, isAuthenticated: false, user: null, isDevMode: false });
          return false;
        }
      },

      /* ── REGISTER (Supabase signUp) ── */
      register: async (email: string, password: string, userData?: RegisterUserData) => {
        set({ isLoading: true, registerError: null });

        /* ── DEV BYPASS ── */
        if (DEV_BYPASS_ENABLED) {
          const bypassUser = createBypassUser(email);
          await new Promise((r) => setTimeout(r, 400));
          set({ isAuthenticated: true, isDevMode: true, user: bypassUser, registerError: null, isLoading: false });
          return true;
        }

        try {
          // Pass user metadata in options.data for webhook processing
          const { error: authError } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              data: {
                full_name: userData?.full_name || '',
                phone: userData?.phone || '',
                telegram: userData?.telegram || '',
              }
            }
          });
          if (authError) {
            const message = authError.message === 'User already registered'
              ? 'Este email já está registado.'
              : authError.message;
            set({ registerError: message, isLoading: false });
            return false;
          }

          // Registration succeeded — try to fetch profile (may not exist yet on backend)
          const profile = await fetchUserProfile();
          if (profile) {
            set({ isAuthenticated: true, isDevMode: false, user: profile, registerError: null, isLoading: false });
          } else {
            // Profile not yet created on backend — set minimal user from Supabase session
            const { data: { session } } = await supabase.auth.getSession();
            const minimalUser: AuthUser = {
              id: session?.user?.id ?? '',
              username: email,
              email,
              role: 'customer' as UserRole,
              kyc_level: 0,
              organization_id: '',
              created_at: new Date().toISOString(),
            };
            set({ isAuthenticated: true, isDevMode: false, user: minimalUser, registerError: null, isLoading: false });
          }
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erro de conexão com o servidor.';
          set({ registerError: message, isLoading: false });
          return false;
        }
      },

      /* ── LOGOUT (Supabase signOut) ── */
      logout: async () => {
        try {
          await supabase.auth.signOut();
        } catch { /* ignore Supabase signOut failures */ }
        set({ isAuthenticated: false, user: null, loginError: null, registerError: null, isLoading: false, isDevMode: false });
      },

      /* ── VALIDATE TOKEN (Supabase session + /users/me) ── */
      validateToken: async () => {
        /* ── DEV BYPASS ── */
        if (DEV_BYPASS_ENABLED) {
          // Check if we already have a persisted dev-mode user
          set((state) => {
            if (state.isAuthenticated && state.isDevMode && state.user) return state;
            return { isAuthenticated: false, user: null, isLoading: false };
          });
          return;
        }

        set({ isLoading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            set({ isAuthenticated: false, user: null, isLoading: false, isDevMode: false });
            return;
          }

          // Valid session — fetch profile
          const profile = await fetchUserProfile();
          if (profile) {
            set({ isAuthenticated: true, isDevMode: false, user: profile, isLoading: false });
          } else {
            // Session exists but no backend profile — sign out
            await supabase.auth.signOut();
            set({ isAuthenticated: false, user: null, isLoading: false, isDevMode: false });
          }
        } catch {
          set({ isAuthenticated: false, user: null, isLoading: false, isDevMode: false });
        }
      },

      /* ── GET SESSION (Supabase getSession + /users/me) ── */
      getSession: async () => {
        if (DEV_BYPASS_ENABLED) {
          set((state) => {
            if (state.isAuthenticated && state.isDevMode && state.user) return state;
            return { isAuthenticated: false, user: null, isLoading: false };
          });
          return;
        }

        set({ isLoading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            set({ isAuthenticated: false, user: null, isLoading: false, isDevMode: false });
            return;
          }

          const profile = await fetchUserProfile();
          if (profile) {
            set({ isAuthenticated: true, isDevMode: false, user: profile, isLoading: false });
          } else {
            set({ isAuthenticated: false, user: null, isLoading: false, isDevMode: false });
          }
        } catch {
          set({ isAuthenticated: false, user: null, isLoading: false, isDevMode: false });
        }
      },
    }),
    {
      name: 'atlas-gp-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isDevMode: state.isDevMode,
        user: state.user,
      }),
    }
  )
);
