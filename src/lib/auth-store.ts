/**
 * Atlas Core — Auth Store (Zustand)
 * 
 * V3.0 — TOTALMENTE desacoplado do Supabase.
 * Autenticação via Atlas Core Banking API REST.
 * JWT guardado em localStorage, injetado pelo atlas-client.ts
 * 
 * DEV_MOCK: quando NEXT_PUBLIC_ENABLE_DEV_MOCK=true,
 * aceita qualquer credencial (sem backend real).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, clearTokens } from './api/atlas-client';
import type { AtlasRole, TierLevel, AccountStatus, AuthenticatedUser } from '@/types/atlas';

/**
 * Maps backend role strings to frontend AtlasRole.
 * Backend sends 'operator' (Admin/Team) or 'user' (Merchant/Lojista).
 * Frontend uses 'admin', 'merchant', 'customer'.
 */
export function mapBackendRole(backendRole?: string | null): AtlasRole {
  if (!backendRole) return 'customer';
  const r = backendRole.toLowerCase();
  if (r === 'admin' || r === 'operator' || r === 'orgoperator') return 'admin';
  if (r === 'merchant' || r === 'user' || r === 'seller') return 'merchant';
  return 'customer';
}

/* ═══════════════════════════════════════════════════════════
   DEV MOCK MODE
   ═══════════════════════════════════════════════════════════ */

export const IS_DEV_MOCK = process.env.NEXT_PUBLIC_ENABLE_DEV_MOCK === 'true';

if (IS_DEV_MOCK) {
  console.warn(
    '[Atlas Core] ⚠️  DEV_MOCK is ACTIVE. All API calls return mock data.',
  );
}

function createMockUser(identifier: string, role: AtlasRole = 'admin'): AuthenticatedUser {
  return {
    id: 'dev-user-001',
    email: identifier.includes('@') ? identifier : `${identifier}@atlascore.dev`,
    fullName: role === 'merchant' ? 'Lojista Demo' : 'NeXFlowX Operator',
    role,
    tier: role === 'merchant' ? 'TIER_1_BASIC' as TierLevel : 'TIER_3_CORPORATE' as TierLevel,
    status: 'ACTIVE' as AccountStatus,
    organizationName: role === 'merchant' ? 'Demo Store' : 'NEXOR',
    organizationId: 'dev-org-001',
  };
}

/* ═══════════════════════════════════════════════════════════
   STORE INTERFACE
   ═══════════════════════════════════════════════════════════ */

interface AuthStore {
  isAuthenticated: boolean;
  isLoading: boolean;
  isDevMode: boolean;
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
      isDevMode: false,
      user: null,
      loginError: null,
      registerError: null,

      /* ── LOGIN ── */
      login: async (identifier: string, password: string) => {
        set({ isLoading: true, loginError: null });

        // DEV_MOCK bypass
        if (IS_DEV_MOCK) {
          await new Promise((r) => setTimeout(r, 400));
          const mockUser = createMockUser(identifier);
          set({
            isAuthenticated: true,
            isDevMode: true,
            user: mockUser,
            loginError: null,
            isLoading: false,
          });
          return true;
        }

        try {
          const response = await authApi.login({ identifier, password });
          // Normalize backend role (e.g. 'operator' → 'admin', 'user' → 'merchant')
          const normalizedUser: AuthenticatedUser = {
            ...response.user,
            role: mapBackendRole(response.user.role),
          };
          set({
            isAuthenticated: true,
            isDevMode: false,
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
            isDevMode: false,
          });
          return false;
        }
      },

      /* ── REGISTER ── */
      register: async (email: string, password: string, nickname?: string) => {
        set({ isLoading: true, registerError: null });

        if (IS_DEV_MOCK) {
          await new Promise((r) => setTimeout(r, 400));
          const mockUser = createMockUser(email);
          mockUser.tier = 'TIER_0_UNVERIFIED';
          set({
            isAuthenticated: true,
            isDevMode: true,
            user: mockUser,
            registerError: null,
            isLoading: false,
          });
          return true;
        }

        try {
          const response = await authApi.register({ email, password, nickname });
          const normalizedUser: AuthenticatedUser = {
            ...response.user,
            role: mapBackendRole(response.user.role),
          };
          set({
            isAuthenticated: true,
            isDevMode: false,
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
          if (!IS_DEV_MOCK) {
            await authApi.logout();
          }
        } catch { /* ignore */ }
        clearTokens();
        set({
          isAuthenticated: false,
          user: null,
          loginError: null,
          registerError: null,
          isLoading: false,
          isDevMode: false,
        });
      },

      /* ── VALIDATE TOKEN ── */
      validateToken: async () => {
        if (IS_DEV_MOCK) {
          // Check persisted state
          set((state) => {
            if (state.isAuthenticated && state.isDevMode && state.user) return state;
            return { isAuthenticated: false, user: null, isLoading: false };
          });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await authApi.me();
          const normalizedUser: AuthenticatedUser = {
            ...user,
            role: mapBackendRole(user.role),
          };
          set({ isAuthenticated: true, isDevMode: false, user: normalizedUser, isLoading: false });
        } catch {
          clearTokens();
          set({ isAuthenticated: false, user: null, isLoading: false, isDevMode: false });
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
        isDevMode: state.isDevMode,
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
