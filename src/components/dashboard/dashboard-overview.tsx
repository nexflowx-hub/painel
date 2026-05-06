'use client';

import { useWallets, useWalletTotals, useTransactions } from '@/hooks/use-wallets';
import { useDashboardStore } from '@/lib/dashboard-store';
import { TIER_CONFIG } from '@/lib/rbac';
import { IS_DEV_MOCK } from '@/lib/auth-store';
import {
  TrendingDown, Clock, Wallet,
  Download, ArrowLeftRight,
  Banknote, ShieldAlert,
} from 'lucide-react';
import WorldMapNetwork from './world-map-network';
import TradingViewTicker from './tradingview-ticker';
import PartnersMarquee from './partners-marquee';
import type { Wallet as WalletType, Transaction, WalletSummary } from '@/types/atlas';

/* ─── Helpers ─── */
function fmt(n: number, currency: string) {
  try {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n);
  } catch {
    // Fallback for non-standard currency codes (e.g. USDT, BTC, ETH)
    const symbols: Record<string, string> = { USDT: '₮', BTC: '₿', ETH: 'Ξ', USDC: 'USDC' };
    const sym = symbols[currency] || currency;
    return `${sym} ${n.toFixed(2)}`;
  }
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

/* ─── KPI Card (horizontal: icon-left, text-right) ─── */
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
    <div
      className="glass-panel p-4 sm:p-5 hover-lift cursor-default flex items-center gap-4"
      style={{ minHeight: '80px' }}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}10`, border: `1px solid ${color}25` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>

      {/* Text content */}
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <p className="nex-mono text-[10px] uppercase tracking-wider mb-0.5 truncate" style={{ color: '#A0A0A0' }}>
          {title}
        </p>
        <p className="text-lg sm:text-xl font-bold nex-mono truncate" style={{ color }}>
          {value}
        </p>
        {subtitle && (
          <p className="nex-mono text-[10px] mt-0.5 truncate" style={{ color: '#606060' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Quick Action Pill Button ─── */
function QuickActionPill({
  icon: Icon, label, onClick, color,
}: {
  icon: React.ElementType; label: string; onClick: () => void; color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto justify-center"
      style={{
        background: `${color}08`,
        border: `1px solid ${color}18`,
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-105"
        style={{ background: `${color}12`, border: `1px solid ${color}20` }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color }} />
      </div>
      <span className="text-sm font-medium whitespace-nowrap" style={{ color: '#FFFFFF' }}>
        {label}
      </span>
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
      {/* ── 1. TradingView Ticker Tape (transparent, no wrapper) ── */}
      <TradingViewTicker />

      {/* DEV_MOCK indicator */}
      {IS_DEV_MOCK && (
        <div className="flex items-center justify-between">
          <DevMockBadge />
        </div>
      )}

      {/* ── 2. World Map — Full Width, Prominent ── */}
      <div className="w-full overflow-hidden rounded-2xl" style={{ height: '240px', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="w-full h-full" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <WorldMapNetwork />
          </div>
        </div>
      </div>

      {/* ── 3. KPI Cards — 4-Balance Pipeline ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

      {/* ── 4. Quick Action Buttons ── */}
      <div
        className="glass-panel p-3 sm:p-4"
        style={{ background: 'rgba(14,17,23,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <p className="nex-mono text-[10px] uppercase tracking-widest mb-3 px-1" style={{ color: '#606060' }}>
          Ações Rápidas
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <QuickActionPill
            icon={Download}
            label="Depositar"
            onClick={() => setActiveSection('deposits')}
            color="#00D4AA"
          />
          <QuickActionPill
            icon={ArrowLeftRight}
            label="Converter Moeda"
            onClick={() => setActiveSection('swap')}
            color="#00B4D8"
          />
          <QuickActionPill
            icon={Banknote}
            label="Levantamentos"
            onClick={() => setActiveSection('payouts')}
            color="#FFB800"
          />
        </div>
      </div>

      {/* ── 5. Recent Activity — Full Width ── */}
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

      {/* ── 6. Partners Marquee ── */}
      <PartnersMarquee />
    </div>
  );
}
