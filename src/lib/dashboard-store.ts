/**
 * Atlas Core — Dashboard Store (Zustand)
 * 
 * Gestão da navegação por secções do dashboard.
 * Usa o RBAC para garantir que apenas secções permitidas são acessíveis.
 * Role é lida dinamicamente do auth-store (nunca hardcoded).
 */

import { create } from 'zustand';
import type { DashboardSection } from './rbac';
export type { DashboardSection } from './rbac';
import { getDefaultSection, hasAccess } from './rbac';
import { useAuthStore, getUserRole } from './auth-store';
import type { AtlasRole } from '@/types/atlas';

interface DashboardStore {
  activeSection: DashboardSection;
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;

  setActiveSection: (section: DashboardSection) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activeSection: 'dashboard',
  sidebarCollapsed: false,
  sidebarOpen: false,

  setActiveSection: (section) => {
    // Read role dynamically from auth store — NEVER hardcoded
    const { user } = useAuthStore.getState();
    const role: AtlasRole = getUserRole(user);
    if (hasAccess(role, section)) {
      set({ activeSection: section });
    } else {
      // Fallback to default section for role
      set({ activeSection: getDefaultSection(role) });
    }
  },

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
