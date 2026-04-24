'use client';

import { useState } from 'react';
import { useWallets, usePayout } from '@/hooks/use-wallets';
import { useDashboardStore } from '@/lib/dashboard-store';
import {
  TrendingDown, Clock, Wallet,
  ArrowUpRight, ArrowLeftRight, Download,
  CircleDollarSign, AlertTriangle,
} from 'lucide-react';
import type { Wallet as WalletType } from '@/lib/api/contracts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

/* ─── Formatters ─── */
function fmt(n: number, code: string) {
  try {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: code, minimumFractionDigits: 2 }).format(n);
  } catch {
    return `${code} ${n.toFixed(2)}`;
  }
}

function fmtCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

/* ─── Settlement Stage Card ─── */
function SettlementCard({
  title,
  subtitle,
  amount,
  currency,
  color,
  icon: Icon,
  action,
  accentLine = true,
}: {
  title: string;
  subtitle: string;
  amount: string;
  currency: string;
  color: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  accentLine?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden p-5 md:p-6 rounded-xl transition-all hover-lift"
      style={{
        background: 'rgba(14, 17, 23, 0.85)',
        border: `1px solid ${color}15`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Top accent line */}
      {accentLine && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
          }}
        />
      )}

      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${color}06, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 md:w-11 md:h-11 rounded-lg flex items-center justify-center"
              style={{ background: `${color}0D`, border: `1px solid ${color}1A` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                {title}
              </h3>
              <p className="nex-mono text-[9px] md:text-[10px] leading-tight" style={{ color: '#606060' }}>
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Amount */}
        <p
          className="text-xl md:text-2xl font-bold nex-mono tracking-tight mb-4"
          style={{ color }}
        >
          {amount}
        </p>

        {/* Action */}
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    </div>
  );
}

/* ─── Payout Dialog ─── */
function PayoutDialog({
  open,
  onOpenChange,
  wallets,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallets: WalletType[];
}) {
  const payoutMutation = usePayout();
  const [method, setMethod] = useState<'CRYPTO' | 'IBAN' | 'PIX' | 'SEPA' | 'BANK'>('IBAN');
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');

  const availableWallets = wallets.filter((w) => w.balance_available > 0);
  const selectedWallet = availableWallets[0];

  const methods = [
    { id: 'IBAN' as const, label: 'IBAN', desc: 'Transferência SEPA' },
    { id: 'PIX' as const, label: 'PIX', desc: 'Instantâneo BRL' },
    { id: 'CRYPTO' as const, label: 'Crypto', desc: 'USDT / BTC / ETH' },
    { id: 'SEPA' as const, label: 'SEPA', desc: 'Euro Zone' },
    { id: 'BANK' as const, label: 'Bank', desc: 'Transferência Manual' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet || !amount || !destination) return;
    try {
      await payoutMutation.mutateAsync({
        amount: Number(amount),
        currency: selectedWallet.currency_code,
        method,
        destination,
      });
      toast.success('Payout solicitado com sucesso');
      onOpenChange(false);
      setAmount('');
      setDestination('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao solicitar payout');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        style={{
          background: '#14171E',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
            Solicitar Payout
          </DialogTitle>
          <DialogDescription className="nex-mono text-[11px]" style={{ color: '#606060' }}>
            Levantamento de capital disponível da tesouraria
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Wallet Selection */}
          <div>
            <Label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
              Carteira Origem
            </Label>
            <div className="mt-1.5 flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="nex-mono text-sm font-semibold" style={{ color: '#00D4AA' }}>
                {selectedWallet?.currency_code || 'EUR'}
              </span>
              <span className="nex-mono text-[10px]" style={{ color: '#606060' }}>
                Disponível: {selectedWallet ? fmt(selectedWallet.balance_available, selectedWallet.currency_code) : '€0.00'}
              </span>
            </div>
          </div>

          {/* Method Selection */}
          <div>
            <Label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
              Método
            </Label>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {methods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className="p-2 rounded-lg text-center transition-all"
                  style={{
                    background: method === m.id ? 'rgba(0,212,170,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${method === m.id ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <span className="nex-mono text-[11px] font-semibold" style={{ color: method === m.id ? '#00D4AA' : '#A0A0A0' }}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
              Montante
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="mt-1.5 nex-mono"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#FFFFFF',
              }}
            />
          </div>

          {/* Destination */}
          <div>
            <Label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
              {method === 'CRYPTO' ? 'Endereço da Carteira' : 'IBAN / Chave PIX / Conta'}
            </Label>
            <Input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={method === 'CRYPTO' ? '0x... ou bc1...' : 'PT50 0000 0000 0000 0000 0000 0'}
              className="mt-1.5 nex-mono text-xs"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#FFFFFF',
              }}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={payoutMutation.isPending || !amount || !destination}
            className="w-full nex-mono text-xs uppercase tracking-wider font-semibold"
            style={{
              background: '#00D4AA',
              color: '#0F1117',
              border: 'none',
            }}
          >
            {payoutMutation.isPending ? 'A processar...' : 'Confirmar Payout'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main Treasury Component ─── */
export default function WalletCards() {
  const { data: wallets, isLoading } = useWallets();
  const { setActiveSection } = useDashboardStore();
  const [payoutOpen, setPayoutOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl p-6" style={{ background: 'rgba(14,17,23,0.85)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <div>
                  <div className="h-4 w-24 rounded mb-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="h-3 w-32 rounded" style={{ background: 'rgba(255,255,255,0.03)' }} />
                </div>
              </div>
              <div className="h-8 w-36 rounded mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const allWallets: WalletType[] = wallets ?? [];

  // Aggregate totals across all wallets
  const totals = allWallets.reduce(
    (acc, w) => {
      acc.incoming += w.balance_incoming;
      acc.pending += w.balance_pending;
      acc.available += w.balance_available;
      acc.total += w.balance_available + w.balance_pending + w.balance_incoming;
      return acc;
    },
    { incoming: 0, pending: 0, available: 0, total: 0 }
  );

  const primaryCurrency = allWallets.length > 0 ? allWallets[0].currency_code : 'EUR';

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
            Tesouraria
          </h2>
          <p className="nex-mono text-[10px] mt-0.5" style={{ color: '#606060' }}>
            Capital Pipeline · Settlement Engine · {allWallets.length} carteiras
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="nex-mono text-[10px] px-2.5 py-1 rounded-md"
            style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.15)', color: '#00D4AA' }}
          >
            TOTAL: {fmt(totals.total, primaryCurrency)}
          </span>
        </div>
      </div>

      {/* 3-Stage Settlement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Incoming */}
        <SettlementCard
          title="Entrada (Hoje)"
          subtitle="Capital bruto faturado nas últimas 24h — ciclo de compensação"
          amount={fmt(totals.incoming, primaryCurrency)}
          currency={primaryCurrency}
          color="#00D4AA"
          icon={TrendingDown}
          accentLine
        />

        {/* Card 2: Pending / In Settlement */}
        <SettlementCard
          title="Em Liquidação"
          subtitle="Dinheiro em trânsito — regras de provedores (D+1, D+4)"
          amount={fmt(totals.pending, primaryCurrency)}
          currency={primaryCurrency}
          color="#FFB800"
          icon={Clock}
          accentLine
        />

        {/* Card 3: Available — with Payout action */}
        <SettlementCard
          title="Disponível para Saque"
          subtitle="Capital físico livre na tesouraria"
          amount={fmt(totals.available, primaryCurrency)}
          currency={primaryCurrency}
          color="#00B4D8"
          icon={Wallet}
          action={
            <button
              onClick={() => setPayoutOpen(true)}
              className="nex-mono text-[10px] uppercase tracking-wider font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2"
              style={{
                background: 'rgba(0,180,216,0.1)',
                border: '1px solid rgba(0,180,216,0.25)',
                color: '#00B4D8',
              }}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Solicitar Payout
            </button>
          }
          accentLine
        />
      </div>

      {/* Quick Actions Bar */}
      <div
        className="p-4 rounded-xl"
        style={{
          background: 'rgba(14,17,23,0.6)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <p className="nex-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: '#606060' }}>
          Ações Rápidas
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSection('deposits')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
            style={{
              background: 'rgba(0,212,170,0.06)',
              border: '1px solid rgba(0,212,170,0.12)',
              color: '#00D4AA',
            }}
          >
            <Download className="w-3.5 h-3.5" />
            Depositar
          </button>
          <button
            onClick={() => setActiveSection('swap')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
            style={{
              background: 'rgba(0,180,216,0.06)',
              border: '1px solid rgba(0,180,216,0.12)',
              color: '#00B4D8',
            }}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Converter Moeda
          </button>
          <button
            onClick={() => setActiveSection('activity')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
            style={{
              background: 'rgba(168,85,247,0.06)',
              border: '1px solid rgba(168,85,247,0.12)',
              color: '#A855F7',
            }}
          >
            <CircleDollarSign className="w-3.5 h-3.5" />
            Ver Ledger
          </button>
        </div>
      </div>

      {/* Per-Currency Wallet Breakdown */}
      {allWallets.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'rgba(14,17,23,0.6)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="nex-mono text-[10px] uppercase tracking-widest" style={{ color: '#606060' }}>
              Carteiras por Moeda ({allWallets.length})
            </p>
          </div>

          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <p className="col-span-2 nex-mono text-[9px] uppercase tracking-wider" style={{ color: '#606060' }}>Moeda</p>
            <p className="col-span-2 nex-mono text-[9px] uppercase tracking-wider text-right" style={{ color: '#606060' }}>Entrada</p>
            <p className="col-span-2 nex-mono text-[9px] uppercase tracking-wider text-right" style={{ color: '#606060' }}>Pendente</p>
            <p className="col-span-3 nex-mono text-[9px] uppercase tracking-wider text-right" style={{ color: '#606060' }}>Disponível</p>
            <p className="col-span-1 nex-mono text-[9px] uppercase tracking-wider text-right" style={{ color: '#606060' }}>Tipo</p>
          </div>

          {/* Wallet rows */}
          <div className="max-h-[320px] overflow-y-auto cyber-scrollbar">
            {allWallets.map((w) => (
              <div
                key={w.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-3 transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}
              >
                {/* Mobile view */}
                <div className="md:hidden flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="nex-mono text-sm font-semibold" style={{ color: '#FFFFFF' }}>{w.currency_code}</span>
                    <span className="neon-badge neon-badge-teal" style={{ fontSize: '9px' }}>{w.type}</span>
                  </div>
                  <span className="nex-mono text-sm font-bold" style={{ color: '#00D4AA' }}>
                    {fmt(w.balance_available, w.currency_code)}
                  </span>
                </div>
                <div className="md:hidden flex items-center gap-3">
                  <span className="nex-mono text-[10px]" style={{ color: '#00D4AA' }}>
                    ↗ {fmt(w.balance_incoming, w.currency_code)}
                  </span>
                  <span className="nex-mono text-[10px]" style={{ color: '#FFB800' }}>
                    ⏳ {fmt(w.balance_pending, w.currency_code)}
                  </span>
                </div>

                {/* Desktop view */}
                <div className="hidden md:block col-span-2 nex-mono text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                  {w.currency_code}
                </div>
                <div className="hidden md:block col-span-2 nex-mono text-sm text-right" style={{ color: '#00D4AA' }}>
                  {w.balance_incoming > 0 ? fmt(w.balance_incoming, w.currency_code) : '—'}
                </div>
                <div className="hidden md:block col-span-2 nex-mono text-sm text-right" style={{ color: '#FFB800' }}>
                  {w.balance_pending > 0 ? fmt(w.balance_pending, w.currency_code) : '—'}
                </div>
                <div className="hidden md:block col-span-3 nex-mono text-sm text-right font-semibold" style={{ color: '#00B4D8' }}>
                  {fmt(w.balance_available, w.currency_code)}
                </div>
                <div className="hidden md:flex col-span-1 justify-end">
                  <span className={`neon-badge ${w.type === 'merchant' ? 'neon-badge-teal' : w.type === 'treasury' ? 'neon-badge-amber' : w.type === 'fx_pool' ? 'neon-badge-cyan' : 'neon-badge-red'}`}>
                    {w.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payout Dialog */}
      <PayoutDialog
        open={payoutOpen}
        onOpenChange={setPayoutOpen}
        wallets={allWallets}
      />
    </div>
  );
}
