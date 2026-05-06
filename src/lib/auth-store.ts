/**
 * Atlas Core — Auth Store (Zustand)
 * 
 * V4.0 — Produção
 * Autenticação via Atlas Core Banking API REST.
 * JWT guardado em localStorage, injetado pelo atlas-client.ts
 * Role mapeada dinamicamente do payload do backend.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, clearTokens } from './api/atlas-client';
import type { AtlasRole, TierLevel, AccountStatus, AuthenticatedUser } from '@/types/atlas';

/**
 * Maps backend role strings to frontend AtlasRole.
 * Backend: 'OrgOperator' (Admin/Equipa) vs 'User' (Merchant/Lojista)
 * Frontend: 'admin', 'merchant', 'customer'
 */
export function mapBackendRole(backendRole?: string | null): AtlasRole {
  if (!backendRole) return 'customer';
  const r = backendRole.toLowerCase();
  if (r === 'admin' || r === 'operator' || r === 'orgoperator') return 'admin';
  if (r === 'merchant' || r === 'user' || r === 'seller') return 'merchant';
  return 'customer';
}

/* ═══════════════════════════════════════════════════════════
   STORE INTERFACE
   ═══════════════════════════════════════════════════════════ */

interface AuthStore {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthenticatedUser | null;
  loginError: string | null;
  registerError: string | null;

  /** Login via Atlas Core API */
  login: (identifier: string, password: string) => Promise<boolean>;
  /** Register via Atlas Core API */
  register: (email: string, password: string, nickname?: string) => Promise<boolean>;
  /** Logout — limpa JWT e estado */
  logout: () => Promise<void>;
  /** Valida sessão (verifica JWT + /auth/me) */
  validateToken: () => Promise<void>;
  /** Atualiza dados do utilizador localmente */
  updateUser: (data: Partial<AuthenticatedUser>) => void;
}

/* ═══════════════════════════════════════════════════════════
   ZUSTAND STORE
   ═══════════════════════════════════════════════════════════ */

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      loginError: null,
      registerError: null,

      /* ── LOGIN ── */
      login: async (identifier: string, password: string) => {
        set({ isLoading: true, loginError: null });

        try {
          const response = await authApi.login({ identifier, password });
          // Normalize backend role (e.g. 'OrgOperator' → 'admin', 'User' → 'merchant')
          const normalizedUser: AuthenticatedUser = {
            ...response.user,
            role: mapBackendRole(response.user.role),
          };
          set({
            isAuthenticated: true,
            user: normalizedUser,
            loginError: null,
            isLoading: false,
          });
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erro de conexão com o Atlas Core.';
          set({
            loginError: message,
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          return false;
        }
      },

      /* ── REGISTER ── */
      register: async (email: string, password: string, nickname?: string) => {
        set({ isLoading: true, registerError: null });

        try {
          const response = await authApi.register({ email, password, nickname });
          const normalizedUser: AuthenticatedUser = {
            ...response.user,
            role: mapBackendRole(response.user.role),
          };
          set({
            isAuthenticated: true,
            user: normalizedUser,
            registerError: null,
            isLoading: false,
          });
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erro ao criar conta.';
          set({ registerError: message, isLoading: false });
          return false;
        }
      },

      /* ── LOGOUT ── */
      logout: async () => {
        try {
          await authApi.logout();
        } catch { /* ignore */ }
        clearTokens();
        set({
          isAuthenticated: false,
          user: null,
          loginError: null,
          registerError: null,
          isLoading: false,
        });
      },

      /* ── VALIDATE TOKEN ── */
      validateToken: async () => {
        set({ isLoading: true });
        try {
          const user = await authApi.me();
          const normalizedUser: AuthenticatedUser = {
            ...user,
            role: mapBackendRole(user.role),
          };
          set({ isAuthenticated: true, user: normalizedUser, isLoading: false });
        } catch {
          clearTokens();
          set({ isAuthenticated: false, user: null, isLoading: false });
        }
      },

      /* ── UPDATE USER (local) ── */
      updateUser: (data: Partial<AuthenticatedUser>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },
    }),
    {
      name: 'atlas-core-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

export function isAdmin(user: AuthenticatedUser | null): boolean {
  return user?.role === 'admin';
}

export function isMerchant(user: AuthenticatedUser | null): boolean {
  return user?.role === 'merchant' || user?.role === 'admin';
}

export function isCustomer(user: AuthenticatedUser | null): boolean {
  return user?.role === 'customer';
}

/**
 * Returns the effective role, mapping raw backend values if needed.
 * Safe to call with any role string from the API.
 */
export function getUserRole(user: AuthenticatedUser | null): AtlasRole {
  if (!user) return 'customer';
  return mapBackendRole(user.role);
}
