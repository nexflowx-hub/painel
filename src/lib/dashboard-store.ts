import { create } from 'zustand';

export type DashboardSection =
  | 'dashboard' | 'wallets' | 'activity'
  | 'stores' | 'payment-links' | 'gateways'
  | 'swap' | 'payouts' | 'deposits'
  | 'settings' | 'approvals' | 'liquidity' | 'developer';

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
  setActiveSection: (section) => set({ activeSection: section }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
