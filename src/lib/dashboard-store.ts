/**
 * Atlas Core — Dashboard Store (Zustand)
 * 
 * Gestão da navegação por secções do dashboard.
 * Usa o RBAC para garantir que apenas secções permitidas são acessíveis.
 */

import { create } from 'zustand';
import type { DashboardSection } from './rbac';
import { getDefaultSection, hasAccess, getUserRole } from './rbac';
import type { AtlasRole } from '@/types/atlas';

interface DashboardStore {
  activeSection: DashboardSection;
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;

  setActiveSection: (section: DashboardSection) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  activeSection: 'dashboard',
  sidebarCollapsed: false,
  sidebarOpen: false,

  setActiveSection: (section) => {
    // RBAC check: only allow if user has access
    const role = 'admin' as AtlasRole; // Will be replaced by actual user role from auth store
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
