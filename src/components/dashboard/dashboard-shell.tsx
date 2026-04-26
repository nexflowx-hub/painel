'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useDashboardStore, type DashboardSection } from '@/lib/dashboard-store';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './sidebar';
import Header from './header';
import LoginPage from './login-page';
import { Logo3D } from '@/components/ui/logo-3d';
import { AIChatWidget } from './ai-chat-widget';
import Footer from './footer';

function useMounted() {
  const [mounted, setMounted] = useState(false);
  const callback = () => setMounted(true);
  useEffect(() => {
    const id = requestAnimationFrame(callback);
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}

/* ─── Lazy-loaded section components ─── */
import dynamic from 'next/dynamic';

const DashboardOverview = dynamic(() => import('./dashboard-overview'), { loading: () => <SectionLoading /> });
const WalletCards = dynamic(() => import('./wallet-cards'), { loading: () => <SectionLoading /> });
const SwapWidget = dynamic(() => import('./swap-widget'), { loading: () => <SectionLoading /> });
const PayoutWidget = dynamic(() => import('./payout-widget'), { loading: () => <SectionLoading /> });
const DepositWidget = dynamic(() => import('./deposit-widget'), { loading: () => <SectionLoading /> });
const FinancialActivityTable = dynamic(() => import('./financial-activity-table'), { loading: () => <SectionLoading /> });
const SettingsSecurity = dynamic(() => import('./settings-security'), { loading: () => <SectionLoading /> });
const AdminApprovalTable = dynamic(() => import('./admin-approval-table'), { loading: () => <SectionLoading /> });
const SystemLiquidityPanel = dynamic(() => import('./system-liquidity-panel'), { loading: () => <SectionLoading /> });
const ApiManagement = dynamic(() => import('./api-management'), { loading: () => <SectionLoading /> });
const StoresPanel = dynamic(() => import('./stores-panel'), { loading: () => <SectionLoading /> });
const PaymentLinksPanel = dynamic(() => import('./payment-links-panel'), { loading: () => <SectionLoading /> });
const GatewaysPanel = dynamic(() => import('./gateways-panel'), { loading: () => <SectionLoading /> });

/* ─── Section loader ─── */
function SectionLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div
          className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#00D4AA', borderTopColor: 'transparent' }}
        />
        <p className="nex-mono text-xs mt-3" style={{ color: '#606060' }}>A carregar...</p>
      </div>
    </div>
  );
}

/* ─── Section router ─── */
function SectionRenderer({ section }: { section: DashboardSection }) {
  switch (section) {
    case 'dashboard':
      return <DashboardOverview />;
    case 'wallets':
      return <WalletCards />;
    case 'activity':
      return <FinancialActivityTable />;
    case 'stores':
      return <StoresPanel />;
    case 'payment-links':
      return <PaymentLinksPanel />;
    case 'gateways':
      return <GatewaysPanel />;
    case 'swap':
      return <SwapWidget />;
    case 'payouts':
      return <PayoutWidget />;
    case 'deposits':
      return <DepositWidget />;
    case 'settings':
      return <SettingsSecurity />;
    case 'approvals':
      return <AdminApprovalTable />;
    case 'liquidity':
      return <SystemLiquidityPanel />;
    case 'developer':
      return <ApiManagement />;
    default:
      return <DashboardOverview />;
  }
}

/* ─── Dashboard Shell ─── */
export default function DashboardShell() {
  const { isAuthenticated, isLoading, validateToken } = useAuthStore();
  const { activeSection, sidebarCollapsed } = useDashboardStore();
  const isMobile = useIsMobile();
  const mounted = useMounted();

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F1117' }}>
        <div className="text-center">
          <Logo3D size="md" spin showRing />
          <div className="mt-4 inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00D4AA', borderTopColor: 'transparent' }} />
        </div>
      </div>
    );
  }

  // Not authenticated → show login
  if (!isAuthenticated && !isLoading) {
    return <LoginPage />;
  }

  // Loading auth state
  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F1117' }}>
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00D4AA', borderTopColor: 'transparent' }} />
          <p className="nex-mono text-xs mt-3" style={{ color: '#606060' }}>A validar sessão...</p>
        </div>
      </div>
    );
  }

  // Authenticated → show dashboard
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* AI Chat Widget */}
      <AIChatWidget />

      {/* Main content area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-[68px]' : 'ml-[260px]'
        }`}
      >
        {/* Header */}
        <Header />

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 cyber-grid-bg">
          <SectionRenderer section={activeSection} />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
