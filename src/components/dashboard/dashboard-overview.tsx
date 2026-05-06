'use client';

import { useWallets, useWalletTotals, useTransactions } from '@/hooks/use-wallets';
import { useDashboardStore } from '@/lib/dashboard-store';
import { TIER_CONFIG } from '@/lib/rbac';
import { IS_DEV_MOCK } from '@/lib/auth-store';
import {
  TrendingDown, Clock, Wallet, Landmark,
  ArrowUpRight, Download, ArrowLeftRight,
  Banknote, Activity, ShieldAlert,
} from 'lucide-react';
import WorldMapNetwork from './world-map-network';
import TradingViewTicker from './tradingview-ticker';
import PartnersMarquee from './partners-marquee';
import type { Wallet as WalletType, Transaction, WalletSummary } from '@/types/atlas';

/* ─── Helpers ─── */
function fmt(n: number, currency: string) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n);
}

function fmtCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

/** Derive CREDIT / DEBIT from TransactionType */
function isCreditType(type: string): boolean {
  return type === 'PROXY_INCOMING' || type === 'SETTLEMENT';
}

/* ─── KPI Card ─── */
function KPICard({
  title, value, subtitle, color, icon: Icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className="glass-panel p-5 hover-lift cursor-default">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <p className="nex-mono text-[10px] uppercase tracking-wider mb-1 truncate" style={{ color: '#A0A0A0' }}>
            {title}
          </p>
          <p className="text-2xl font-bold nex-mono truncate" style={{ color: color }}>
            {value}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}10`, border: `1px solid ${color}25` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      {subtitle && (
        <p className="nex-mono text-[10px]" style={{ color: '#606060' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ─── Quick Action Card ─── */
function QuickAction({
  icon: Icon, label, onClick, color,
}: {
  icon: React.ElementType; label: string; onClick: () => void; color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="glass-panel p-5 hover-lift text-left group flex flex-col items-start gap-3 w-full"
    >
      <div
        className="w-11 h-11 rounded-lg flex items-center justify-center transition-all group-hover:scale-105"
        style={{ background: `${color}10`, border: `1px solid ${color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>{label}</span>
        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: '#606060' }} />
      </div>
    </button>
  );
}

/* ─── Status dot for transactions ─── */
function TransactionStatusDot({ status }: { status: string }) {
  const cls =
    status === 'COMPLETED' ? 'active' :
    status === 'FAILED' || status === 'BLOCKED' ? 'error' : 'warning';
  return <span className={`status-dot ${cls}`} />;
}

/* ─── Type Badge ─── */
function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    PROXY_INCOMING: 'neon-badge-teal',
    SETTLEMENT: 'neon-badge-teal',
    SWAP: 'neon-badge-cyan',
    PAYOUT: 'neon-badge-amber',
    FEE: 'neon-badge-red',
    TRANSFER: 'neon-badge-purple',
  };
  return <span className={`neon-badge ${map[type] || 'neon-badge-teal'}`}>{type}</span>;
}

/* ─── DEV_MOCK Badge ─── */
function DevMockBadge() {
  return (
    <span
      className="nex-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md inline-flex items-center gap-1.5"
      style={{
        background: 'rgba(255, 184, 0, 0.10)',
        border: '1px solid rgba(255, 184, 0, 0.25)',
        color: '#FFB800',
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#FFB800' }} />
      DEV_MOCK
    </span>
  );
}

/* ─── Main Component ─── */
export default function DashboardOverview() {
  const { setActiveSection } = useDashboardStore();
  const walletsQuery = useWallets();
  const totalsQuery = useWalletTotals();
  const transactionsQuery = useTransactions({ limit: 8 });

  const wallets: WalletType[] = walletsQuery.data ?? [];
  const totals = totalsQuery.data ?? { incoming: 0, pending: 0, available: 0, blocked: 0, total: 0 };
  const transactions: Transaction[] = transactionsQuery.data?.data ?? [];

  const primaryCurrency = wallets.length > 0 ? wallets[0].currency : 'EUR';

  return (
    <div className="space-y-6 animate-fade-up">
      {/* TradingView Ticker Tape */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'rgba(10, 13, 20, 0.6)',
          border: '1px solid rgba(0, 212, 170, 0.08)',
        }}
      >
        <TradingViewTicker />
      </div>

      {/* Header row with DEV_MOCK badge */}
      {IS_DEV_MOCK && (
        <div className="flex items-center justify-between">
          <DevMockBadge />
        </div>
      )}

      {/* KPI Cards — 4-Balance Pipeline: Incoming, Pending, Available, Blocked */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Entrada (Hoje)"
          value={fmt(totals.incoming, primaryCurrency)}
          subtitle="Capital bruto — pré-compensação"
          color="#00D4AA"
          icon={TrendingDown}
        />
        <KPICard
          title="Em Liquidação"
          value={fmt(totals.pending, primaryCurrency)}
          subtitle="Dinheiro em trânsito (D+1, D+4)"
          color="#FFB800"
          icon={Clock}
        />
        <KPICard
          title="Disponível"
          value={fmt(totals.available, primaryCurrency)}
          subtitle={`Capital livre em ${wallets.length} carteiras`}
          color="#00B4D8"
          icon={Wallet}
        />
        <KPICard
          title="Bloqueado"
          value={fmt(totals.blocked, primaryCurrency)}
          subtitle="Fundos retidos — compliance / disputas"
          color="#FF5252"
          icon={ShieldAlert}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="nex-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: '#606060' }}>
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction icon={Landmark} label="Tesouraria" onClick={() => setActiveSection('wallets')} color="#00B4D8" />
          <QuickAction icon={ArrowLeftRight} label="Converter Moeda" onClick={() => setActiveSection('swap')} color="#00B4D8" />
          <QuickAction icon={Banknote} label="Solicitar Payout" onClick={() => setActiveSection('payouts')} color="#FFB800" />
          <QuickAction icon={Activity} label="Ver Transações" onClick={() => setActiveSection('activity')} color="#A855F7" />
        </div>
      </div>

      {/* Bottom grid: Activity + World Map */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>Atividade Recente</h3>
            <button
              onClick={() => setActiveSection('activity')}
              className="nex-mono text-[10px] uppercase tracking-wider transition-colors"
              style={{ color: '#00D4AA' }}
            >
              Ver tudo →
            </button>
          </div>

          {transactionsQuery.isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#333' }} />
                  <div className="h-3 flex-1 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className="nex-mono text-xs" style={{ color: '#606060' }}>Sem transações recentes.</p>
          ) : (
            <div className="space-y-1 max-h-80 overflow-y-auto cyber-scrollbar">
              {transactions.map((entry) => {
                const credit = isCreditType(entry.type);
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-2.5 px-2 rounded-lg transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <TransactionStatusDot status={entry.status} />
                      <TypeBadge type={entry.type} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: '#FFFFFF' }}>
                          {entry.description || entry.type}
                        </p>
                        <p className="nex-mono text-[10px] truncate" style={{ color: '#606060' }}>
                          {new Date(entry.createdAt).toLocaleString('pt-PT')}
                          {entry.feeApplied > 0 && (
                            <span style={{ color: '#FF5252' }}> · Fee: {fmt(entry.feeApplied, entry.currency)}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p
                        className="nex-mono text-sm font-semibold"
                        style={{
                          color: credit ? '#00D4AA' : '#FF5252',
                        }}
                      >
                        {credit ? '+' : '-'}
                        {fmt(entry.amount, entry.currency)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* World Map */}
        <WorldMapNetwork />
      </div>

      {/* Partners Marquee */}
      <PartnersMarquee />
    </div>
  );
}
