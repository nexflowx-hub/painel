'use client';

import { useWallets, useLedger } from '@/hooks/use-wallets';
import { useDashboardStore } from '@/lib/dashboard-store';
import {
  TrendingDown, Clock, Wallet, Landmark,
  ArrowUpRight, Download, ArrowLeftRight,
  Banknote, Activity, CircleDollarSign,
} from 'lucide-react';
import WorldMapNetwork from './world-map-network';
import type { Wallet as WalletType, LedgerEntry } from '@/lib/api/contracts';

/* ─── Helpers ─── */
function fmt(n: number, currency: string) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n);
}

function fmtCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
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

/* ─── Status dot for ledger ─── */
function LedgerStatusDot({ status }: { status: string }) {
  const cls =
    status === 'cleared' ? 'active' :
    status === 'failed' ? 'error' : 'warning';
  return <span className={`status-dot ${cls}`} />;
}

/* ─── Type Badge ─── */
function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    PAYIN: 'neon-badge-teal',
    SWAP: 'neon-badge-cyan',
    PAYOUT: 'neon-badge-amber',
    FEE: 'neon-badge-red',
    REFUND: 'neon-badge-purple',
  };
  return <span className={`neon-badge ${map[type] || 'neon-badge-teal'}`}>{type}</span>;
}

/* ─── Main Component ─── */
export default function DashboardOverview() {
  const { setActiveSection } = useDashboardStore();
  const walletsQuery = useWallets();
  const ledgerQuery = useLedger();

  const wallets: WalletType[] = walletsQuery.data ?? [];
  const ledgerEntries: LedgerEntry[] = ledgerQuery.data?.data ?? [];

  // Aggregate 3-stage settlement totals
  const totals = wallets.reduce(
    (acc, w) => {
      acc.incoming += w.balance_incoming;
      acc.pending += w.balance_pending;
      acc.available += w.balance_available;
      acc.total += w.balance_available + w.balance_pending + w.balance_incoming;
      return acc;
    },
    { incoming: 0, pending: 0, available: 0, total: 0 }
  );

  const primaryCurrency = wallets.length > 0 ? wallets[0].currency_code : 'EUR';

  const recentEntries = ledgerEntries.slice(0, 8);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* KPI Cards — 3-Stage Settlement Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {ledgerQuery.isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#333' }} />
                  <div className="h-3 flex-1 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
                </div>
              ))}
            </div>
          ) : recentEntries.length === 0 ? (
            <p className="nex-mono text-xs" style={{ color: '#606060' }}>Sem transações recentes.</p>
          ) : (
            <div className="space-y-1 max-h-80 overflow-y-auto cyber-scrollbar">
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-2.5 px-2 rounded-lg transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <LedgerStatusDot status={entry.status} />
                    <TypeBadge type={entry.type} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: '#FFFFFF' }}>
                        {entry.description || entry.reference || entry.type}
                      </p>
                      <p className="nex-mono text-[10px] truncate" style={{ color: '#606060' }}>
                        {new Date(entry.created_at).toLocaleString('pt-PT')}
                        {entry.clears_at && (
                          <span style={{ color: '#FFB800' }}> · Clears: {new Date(entry.clears_at).toLocaleDateString('pt-PT')}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p
                      className="nex-mono text-sm font-semibold"
                      style={{
                        color: entry.direction === 'CREDIT' ? '#00D4AA' : '#FF5252',
                      }}
                    >
                      {entry.direction === 'CREDIT' ? '+' : '-'}
                      {fmt(entry.amount, entry.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* World Map */}
        <WorldMapNetwork />
      </div>
    </div>
  );
}


