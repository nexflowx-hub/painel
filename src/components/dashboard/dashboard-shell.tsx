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

/* ─── Section loader with animation ─── */
function SectionLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center animate-fade-up">
        <div className="relative w-12 h-12 mx-auto">
          <div
            className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'rgba(0, 212, 170, 0.3)', borderTopColor: '#00D4AA' }}
          />
          <div
            className="absolute inset-1 rounded-full border border-t-transparent animate-spin"
            style={{ 
              borderColor: 'rgba(0, 180, 216, 0.2)', 
              borderTopColor: '#00B4D8',
              animationDirection: 'reverse',
              animationDuration: '1.5s'
            }}
          />
        </div>
        <p className="nex-mono text-xs mt-4" style={{ color: '#606060' }}>A carregar...</p>
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
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#080a0f' }}
      >
        <div className="text-center animate-scale-in">
          <Logo3D size="md" spin showRing />
          <div className="mt-6 relative w-8 h-8 mx-auto">
            <div
              className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'rgba(0, 212, 170, 0.3)', borderTopColor: '#00D4AA' }}
            />
          </div>
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
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#080a0f' }}
      >
        <div className="text-center animate-fade-up">
          <div className="relative w-10 h-10 mx-auto">
            <div
              className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'rgba(0, 212, 170, 0.3)', borderTopColor: '#00D4AA' }}
            />
          </div>
          <p className="nex-mono text-xs mt-4" style={{ color: '#606060' }}>A validar sessão...</p>
        </div>
      </div>
    );
  }

  // Authenticated → show dashboard
  return (
    <div 
      className="min-h-screen flex bg-background safe-area-top"
      style={{ 
        marginLeft: isMobile ? 0 : sidebarCollapsed ? 68 : 260,
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* AI Chat Widget */}
      <AIChatWidget />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header />

        {/* Main content */}
        <main 
          className="flex-1 p-3 sm:p-4 md:p-6 cyber-grid-bg overflow-x-hidden"
          style={{ 
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
          }}
        >
          <div className="animate-fade-up">
            <SectionRenderer section={activeSection} />
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
