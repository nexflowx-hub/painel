'use client';

import { useState, useEffect } from 'react';
import { useDashboardStore, type DashboardSection } from '@/lib/dashboard-store';
import { useAuthStore, getUserRole, IS_DEV_MODE } from '@/lib/auth-store';
import { useIsMobile } from '@/hooks/use-mobile';
import { Search, Bell, Crown, Shield, User, CircleDot, Terminal, Menu } from 'lucide-react';
import type { UserRole } from '@/lib/api/contracts';

const sectionLabels: Record<DashboardSection, string> = {
  dashboard: 'Dashboard',
  wallets: 'Tesouraria / Wallets',
  swap: 'Converter Moeda',
  payouts: 'Levantamentos',
  activity: 'Transações',
  deposits: 'Depósitos',
  stores: 'Lojas & Marcas',
  'payment-links': 'Links de Pagamento',
  gateways: 'Gateways & API',
  developer: 'Developer / API',
  settings: 'Definições',
  approvals: 'Aprovações',
  liquidity: 'Liquidez do Sistema',
};

const roleConfig: Record<UserRole, { label: string; icon: React.ElementType; color: string; badgeClass: string }> = {
  admin: { label: 'ADMIN', icon: Crown, color: '#FFB800', badgeClass: 'neon-badge-amber' },
  merchant: { label: 'MERCHANT', icon: Shield, color: '#00B4D8', badgeClass: 'neon-badge-cyan' },
  customer: { label: 'CUSTOMER', icon: User, color: '#A855F7', badgeClass: 'neon-badge-purple' },
};

export default function Header() {
  const { activeSection, setSidebarOpen } = useDashboardStore();
  const { user, isDevMode } = useAuthStore();
  const isMobile = useIsMobile();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  const role = getUserRole(user);
  const cfg = roleConfig[role];
  const RoleIcon = cfg.icon;

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3"
      style={{
        background: 'rgba(11, 15, 20, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Left: Hamburger (mobile) + Section title */}
      <div className="flex items-center gap-3 min-w-0">
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-11 h-11 -ml-1 rounded-lg transition-colors"
            style={{ color: '#A0A0A0' }}
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <span className="nex-mono text-[10px] uppercase tracking-wider hidden sm:inline" style={{ color: '#606060' }}>
          AGP://
        </span>
        <h2 className="text-base md:text-lg font-semibold truncate" style={{ color: '#FFFFFF' }}>
          {sectionLabels[activeSection]}
        </h2>
      </div>

      {/* Center: Search (hidden on small screens) */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#606060' }} />
          <input
            type="text"
            placeholder="Pesquisar transações, wallets..."
            className="neon-input w-full pl-10 pr-16 py-2 rounded-lg text-xs"
          />
          <kbd
            className="absolute right-3 top-1/2 -translate-y-1/2 nex-mono text-[10px] px-1.5 py-0.5 rounded"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#606060',
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Clock + notifications + avatar */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Clock (hidden on small screens) */}
        <div className="hidden lg:flex flex-col items-end">
          <span className="nex-mono text-xs" style={{ color: '#FFFFFF' }}>{time}</span>
          <span className="nex-mono text-[10px]" style={{ color: '#606060' }}>{date}</span>
        </div>

        {/* LIVE badge (hidden on very small screens) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: 'rgba(0,212,170,0.06)' }}>
          <CircleDot className="w-3 h-3 neon-pulse" style={{ color: '#00D4AA' }} />
          <span className="nex-mono text-[10px] font-semibold" style={{ color: '#00D4AA' }}>LIVE</span>
        </div>

        {/* Role badge (hidden on mobile) */}
        <div className={`neon-badge ${cfg.badgeClass} hidden sm:flex items-center gap-1`}>
          <RoleIcon className="w-3 h-3" />
          {cfg.label}
        </div>

        {/* DEV badge */}
        {IS_DEV_MODE && isDevMode && (
          <div className="dev-badge hidden md:block">
            <Terminal className="w-3 h-3" />
            DEV
          </div>
        )}

        {/* Notification bell */}
        <button className="relative p-2 rounded-lg transition-colors" style={{ color: '#A0A0A0' }} aria-label="Notificações">
          <Bell className="w-5 h-5" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: '#FF5252', boxShadow: '0 0 6px rgba(255,59,92,0.5)' }}
          />
        </button>

        {/* Avatar (hidden on very small screens) */}
        <div
          className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,180,216,0.15))',
            border: '1px solid rgba(0,212,170,0.25)',
            color: '#00D4AA',
          }}
        >
          NX
        </div>
      </div>
    </header>
  );
}
