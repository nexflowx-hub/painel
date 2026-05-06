'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallets, useWalletTotals } from '@/hooks/use-wallets';
import { useDashboardStore } from '@/lib/dashboard-store';
import { payoutApi } from '@/lib/api/atlas-client';
import type { Wallet, Currency, WalletSummary, PayoutRequest } from '@/types/atlas';
import {
  TrendingDown, Clock, Wallet,
  ArrowUpRight, ArrowLeftRight, Download,
  CircleDollarSign, AlertTriangle, ShieldBan,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

/* ─── Base Currencies for Reference ─── */
const BASE_CURRENCIES: Currency[] = ['EUR', 'USDT', 'USD', 'BRL'];

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

/* ─── Currency Icons ─── */
function CurrencyIcon({ currency }: { currency: string }) {
  const colors: Record<string, string> = {
    EUR: 'linear-gradient(135deg, #003399, #FFCC00)',
    USDT: '#26A17B',
    USD: '#228B22',
    BRL: '#009739',
  };
  
  const symbols: Record<string, string> = {
    EUR: '€',
    USDT: '₮',
    USD: '$',
    BRL: 'R$',
  };

  return (
    <div 
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
      style={{ 
        background: colors[currency] || 'rgba(0, 212, 170, 0.1)',
        color: '#fff',
        border: colors[currency] ? 'none' : '1px solid rgba(0, 212, 170, 0.3)',
      }}
    >
      {symbols[currency] || currency.slice(0, 1)}
    </div>
  );
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
  wallets: Wallet[];
}) {
  const qc = useQueryClient();
  const [method, setMethod] = useState<'CRYPTO' | 'IBAN' | 'PIX' | 'SEPA' | 'BANK'>('IBAN');
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');

  const availableWallets = wallets.filter((w) => w.balanceAvailable > 0);
  const selectedWallet = availableWallets[0];

  const payoutMutation = useMutation({
    mutationFn: (data: PayoutRequest) => payoutApi.request(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

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
        currency: selectedWallet.currency,
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
                {selectedWallet?.currency || 'EUR'}
              </span>
              <span className="nex-mono text-[10px]" style={{ color: '#606060' }}>
                Disponível: {selectedWallet ? fmt(selectedWallet.balanceAvailable, selectedWallet.currency) : '€0.00'}
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
  const { data: totals } = useWalletTotals();
  const { setActiveSection } = useDashboardStore();
  const [payoutOpen, setPayoutOpen] = useState(false);

  if (isLoading || !totals) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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

  const allWallets: Wallet[] = wallets ?? [];

  // Sort wallets to prioritize base currencies (EUR, USDT, USD, BRL)
  const sortedWallets = [...allWallets].sort((a, b) => {
    const aIndex = BASE_CURRENCIES.indexOf(a.currency as Currency);
    const bIndex = BASE_CURRENCIES.indexOf(b.currency as Currency);
    
    // If both are base currencies, sort by index
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    // Base currencies come first
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    // Otherwise, sort alphabetically
    return a.currency.localeCompare(b.currency);
  });

  // Primary currency is EUR if available, otherwise first base currency available, or first wallet
  const primaryCurrency = sortedWallets.find(w => w.currency === 'EUR')?.currency 
    || sortedWallets.find(w => BASE_CURRENCIES.includes(w.currency as Currency))?.currency 
    || (sortedWallets.length > 0 ? sortedWallets[0].currency : 'EUR');

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
            Tesouraria
          </h2>
          <p className="nex-mono text-[10px] mt-0.5" style={{ color: '#606060' }}>
            Capital Pipeline · Settlement Engine · {sortedWallets.length} carteiras
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

      {/* 4-Stage Settlement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        {/* Card 4: Blocked */}
        <SettlementCard
          title="Bloqueado"
          subtitle="Capital retido por compliance, disputas ou KYC pendente"
          amount={fmt(totals.blocked, primaryCurrency)}
          currency={primaryCurrency}
          color="#EF4444"
          icon={ShieldBan}
          action={
            totals.blocked > 0 ? (
              <button
                onClick={() => setActiveSection('activity')}
                className="nex-mono text-[10px] uppercase tracking-wider font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#EF4444',
                }}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Ver Detalhes
              </button>
            ) : undefined
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
      {sortedWallets.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'rgba(14,17,23,0.6)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="nex-mono text-[10px] uppercase tracking-widest" style={{ color: '#606060' }}>
              Carteiras por Moeda ({sortedWallets.length})
            </p>
          </div>

          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <p className="col-span-2 nex-mono text-[9px] uppercase tracking-wider" style={{ color: '#606060' }}>Moeda</p>
            <p className="col-span-2 nex-mono text-[9px] uppercase tracking-wider text-right" style={{ color: '#606060' }}>Entrada</p>
            <p className="col-span-2 nex-mono text-[9px] uppercase tracking-wider text-right" style={{ color: '#606060' }}>Pendente</p>
            <p className="col-span-2 nex-mono text-[9px] uppercase tracking-wider text-right" style={{ color: '#606060' }}>Disponível</p>
            <p className="col-span-2 nex-mono text-[9px] uppercase tracking-wider text-right" style={{ color: '#606060' }}>Bloqueado</p>
            <p className="col-span-2 nex-mono text-[9px] uppercase tracking-wider text-right" style={{ color: '#606060' }}>Referência</p>
          </div>

          {/* Wallet rows */}
          <div className="max-h-[320px] overflow-y-auto cyber-scrollbar">
            {sortedWallets.map((w) => (
              <div
                key={w.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-3 transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}
              >
                {/* Mobile view */}
                <div className="md:hidden flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="nex-mono text-sm font-semibold" style={{ color: '#FFFFFF' }}>{w.currency}</span>
                    <span className="neon-badge neon-badge-teal" style={{ fontSize: '9px' }}>{w.walletReference}</span>
                  </div>
                  <span className="nex-mono text-sm font-bold" style={{ color: '#00B4D8' }}>
                    {fmt(w.balanceAvailable, w.currency)}
                  </span>
                </div>
                <div className="md:hidden flex items-center gap-3">
                  <span className="nex-mono text-[10px]" style={{ color: '#00D4AA' }}>
                    ↗ {fmt(w.balanceIncoming, w.currency)}
                  </span>
                  <span className="nex-mono text-[10px]" style={{ color: '#FFB800' }}>
                    ⏳ {fmt(w.balancePending, w.currency)}
                  </span>
                  {w.balanceBlocked > 0 && (
                    <span className="nex-mono text-[10px]" style={{ color: '#EF4444' }}>
                      🔒 {fmt(w.balanceBlocked, w.currency)}
                    </span>
                  )}
                </div>

                {/* Desktop view */}
                <div className="hidden md:block col-span-2 nex-mono text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                  {w.currency}
                </div>
                <div className="hidden md:block col-span-2 nex-mono text-sm text-right" style={{ color: '#00D4AA' }}>
                  {w.balanceIncoming > 0 ? fmt(w.balanceIncoming, w.currency) : '—'}
                </div>
                <div className="hidden md:block col-span-2 nex-mono text-sm text-right" style={{ color: '#FFB800' }}>
                  {w.balancePending > 0 ? fmt(w.balancePending, w.currency) : '—'}
                </div>
                <div className="hidden md:block col-span-2 nex-mono text-sm text-right font-semibold" style={{ color: '#00B4D8' }}>
                  {fmt(w.balanceAvailable, w.currency)}
                </div>
                <div className="hidden md:block col-span-2 nex-mono text-sm text-right" style={{ color: w.balanceBlocked > 0 ? '#EF4444' : '#606060' }}>
                  {w.balanceBlocked > 0 ? fmt(w.balanceBlocked, w.currency) : '—'}
                </div>
                <div className="hidden md:flex col-span-2 justify-end">
                  <span className="nex-mono text-[10px]" style={{ color: '#A0A0A0' }}>
                    {w.walletReference}
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
        wallets={sortedWallets}
      />
    </div>
  );
}
