'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useAuthStore, getUserRole, IS_DEV_MODE } from '@/lib/auth-store';
import { useDashboardStore, type DashboardSection } from '@/lib/dashboard-store';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './sidebar';
import Header from './header';
import LoginPage from './login-page';
import { LogOut, Terminal } from 'lucide-react';
import { Logo3D } from '@/components/ui/logo-3d';

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
  const { isAuthenticated, isLoading, isDevMode, validateToken, user, logout } = useAuthStore();
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
  const role = getUserRole(user);

  return (
    <div className="min-h-screen flex" style={{ background: '#0F1117' }}>
      {/* Sidebar */}
      <Sidebar />

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

        {/* Footer — 3-Column Legal Structure */}
        <footer
          className="px-4 md:px-6 py-5"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.04)',
            background: 'rgba(8,11,16,0.9)',
          }}
        >
          {/* Top: 3-column legal grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Column 1: Sustentação Legal */}
            <div>
              <p className="nex-mono text-[9px] uppercase tracking-widest mb-2" style={{ color: '#00D4AA' }}>
                Sustentação Legal
              </p>
              <div className="space-y-1.5">
                <p className="nex-mono text-[10px] leading-relaxed" style={{ color: '#A0A0A0' }}>
                  <span style={{ color: '#FFFFFF' }}>IAHUB360 LTD</span> · Holding (Proprietária)
                </p>
                <p className="nex-mono text-[10px] leading-relaxed" style={{ color: '#606060' }}>
                  Terms & Conditions
                </p>
              </div>
            </div>

            {/* Column 2: Ecossistema NeX */}
            <div>
              <p className="nex-mono text-[9px] uppercase tracking-widest mb-2" style={{ color: '#00D4AA' }}>
                Ecossistema NeX
              </p>
              <div className="space-y-1.5">
                <p className="nex-mono text-[10px] leading-relaxed" style={{ color: '#A0A0A0' }}>
                  <span style={{ color: '#FFFFFF' }}>NeX-Systems</span> · Infraestrutura & Sistemas
                </p>
                <p className="nex-mono text-[10px] leading-relaxed" style={{ color: '#A0A0A0' }}>
                  <span style={{ color: '#FFFFFF' }}>NeXTech</span> · Operações & Suporte
                </p>
                <p className="nex-mono text-[10px] leading-relaxed" style={{ color: '#606060' }}>
                  Compliance Manifesto · IP & Licenciamento
                </p>
              </div>
            </div>

            {/* Column 3: Transparência */}
            <div>
              <p className="nex-mono text-[9px] uppercase tracking-widest mb-2" style={{ color: '#00D4AA' }}>
                Transparência
              </p>
              <div className="space-y-1.5">
                <p className="nex-mono text-[10px] leading-relaxed" style={{ color: '#606060' }}>
                  Política de Dados · Security Standards
                </p>
                <p className="nex-mono text-[10px] leading-relaxed" style={{ color: '#606060' }}>
                  Non-Custodial Orchestration · AES-256-GCM
                </p>
                <a
                  href="mailto:atlasglobalpayments@nexflowx.tech"
                  className="nex-mono text-[10px] flex items-center gap-1 transition-colors"
                  style={{ color: '#00B4D8' }}
                >
                  atlasglobalpayments@nexflowx.tech
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar: copyright + user + logout */}
          <div
            className="flex items-center justify-between gap-2 flex-wrap pt-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}
          >
            <div className="flex items-center gap-2.5">
              <Logo3D size="footer" spin={false} showRing={false} />
              <span className="nex-mono text-[10px] whitespace-nowrap" style={{ color: '#606060' }}>
                © 2026 Atlas Global Payments. Powered by NeXFlowX™ (IAHUB360 LTD, UK Reg. 16626733)
              </span>
            </div>

            <div className="flex items-center gap-3">
              {user && (
                <span className="nex-mono text-[10px] hidden sm:block" style={{ color: '#606060' }}>
                  {user.username} · <span className="uppercase">{role}</span>
                </span>
              )}
              {IS_DEV_MODE && isDevMode && (
                <div className="dev-badge hidden md:block">
                  <Terminal className="w-3 h-3" />
                  DEV
                </div>
              )}
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all"
                style={{
                  background: 'rgba(255,59,92,0.06)',
                  border: '1px solid rgba(255,59,92,0.15)',
                  color: '#FF5252',
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
