'use client';

import { useDashboardStore } from '@/lib/dashboard-store';
import { useAuthStore } from '@/lib/auth-store';
import { useIsMobile } from '@/hooks/use-mobile';
import { getSectionsByCategory, type DashboardSection } from '@/lib/rbac';
import { getUserRole, IS_DEV_MOCK } from '@/lib/auth-store';
import {
  LayoutDashboard, Landmark, ReceiptText,
  Store, Link2, Plug, Code2,
  Settings, ClipboardList, Droplets, Percent, Users,
  ChevronLeft, ChevronRight, ShieldCheck,
  ArrowLeftRight, Banknote, Download,
  ShoppingCart,
} from 'lucide-react';
import { Logo3D } from '@/components/ui/logo-3d';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Terminal } from 'lucide-react';

/** Map icon names to components */
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Landmark, ReceiptText, Store, Link2, Plug, Code2,
  Settings, ClipboardList, Droplets, Percent, Users,
  ShieldCheck, ArrowLeftRight, Banknote, Download, ShoppingCart,
};

const categoryLabels: Record<string, string> = {
  operation: 'Operação',
  merchant: 'Merchant',
  administration: 'Administração',
  system: 'Sistema',
};

/* ─── Shared nav list ─── */
function SidebarNav({
  activeSection,
  sidebarCollapsed,
  onNavigate,
}: {
  activeSection: DashboardSection;
  sidebarCollapsed: boolean;
  onNavigate: (id: DashboardSection) => void;
}) {
  const { user } = useAuthStore();
  const role = getUserRole(user);

  const categories = ['operation', 'merchant', 'administration', 'system'] as const;

  return (
    <nav className="flex-1 overflow-y-auto cyber-scrollbar py-3 px-2">
      {categories.map((cat) => {
        const sections = getSectionsByCategory(role, cat);
        if (sections.length === 0) return null;

        return (
          <div key={cat}>
            <div className="nex-mono text-[9px] uppercase tracking-widest px-3 py-2" style={{ color: '#606060' }}>
              {sidebarCollapsed ? '···' : categoryLabels[cat]}
            </div>
            {sections.map((item) => {
              const Icon = iconMap[item.icon || 'LayoutDashboard'] || LayoutDashboard;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`neon-sidebar-link w-full flex items-center gap-3 px-3 py-2.5 rounded-r-lg text-sm transition-all ${
                    isActive ? 'active' : ''
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  {isActive && !sidebarCollapsed && (
                    <div
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: '#00D4AA', boxShadow: '0 0 8px rgba(0,212,170,0.5)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

/* ─── Desktop sidebar (md+) ─── */
function DesktopSidebar() {
  const { activeSection, sidebarCollapsed, setActiveSection, toggleSidebar } = useDashboardStore();

  return (
    <aside
      className={`neon-sidebar fixed top-0 left-0 z-40 h-screen flex-col transition-all duration-300 hidden md:flex ${
        sidebarCollapsed ? 'w-[68px]' : 'w-[260px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        <Logo3D size="sm" spin showRing={false} />
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold tracking-tight whitespace-nowrap">
              <span className="text-[#FFFFFF]">Atlas</span>{' '}<span style={{ color: '#00D4AA' }}>Core</span>
            </h1>
            <p className="nex-mono text-[10px]" style={{ color: '#606060' }}>
              Core Banking Engine v3.0
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <SidebarNav
        activeSection={activeSection}
        sidebarCollapsed={sidebarCollapsed}
        onNavigate={setActiveSection}
      />

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="mx-3 mb-3 flex items-center justify-center gap-2 py-2 rounded-lg transition-all"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
          color: '#A0A0A0',
        }}
      >
        {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        {!sidebarCollapsed && <span className="text-xs">Recolher</span>}
      </button>
    </aside>
  );
}

/* ─── Mobile sidebar (< md) as Sheet drawer ─── */
function MobileSidebar() {
  const { activeSection, sidebarOpen, setActiveSection, setSidebarOpen } = useDashboardStore();

  const handleNavigate = (id: DashboardSection) => {
    setActiveSection(id);
    setSidebarOpen(false);
  };

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent
        side="left"
        className="w-[280px] p-0"
        style={{ background: '#0F1117', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <Logo3D size="sm" spin showRing={false} />
          <div className="overflow-hidden">
            <h1 className="text-base font-bold tracking-tight whitespace-nowrap">
              <span className="text-[#FFFFFF]">Atlas</span>{' '}<span style={{ color: '#00D4AA' }}>Core</span>
            </h1>
            <p className="nex-mono text-[10px]" style={{ color: '#606060' }}>
              Core Banking Engine v3.0
            </p>
          </div>
        </div>
        <SidebarNav activeSection={activeSection} sidebarCollapsed={false} onNavigate={handleNavigate} />
      </SheetContent>
    </Sheet>
  );
}

/* ─── Main export ─── */
export default function Sidebar() {
  const isMobile = useIsMobile();
  return (
    <>
      <DesktopSidebar />
      {isMobile && <MobileSidebar />}
    </>
  );
}
