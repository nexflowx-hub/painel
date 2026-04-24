'use client';

import { useWallets } from '@/hooks/use-wallets';
import { useAuthStore, isAdmin } from '@/lib/auth-store';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Droplets, AlertTriangle, Wallet, TrendingUp, Coins } from 'lucide-react';
import type { Wallet as WalletType, WalletType as WT } from '@/lib/api/contracts';

function fmt(n: number, code: string) {
  try {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: code, minimumFractionDigits: 2 }).format(n);
  } catch {
    return `${code} ${n.toFixed(2)}`;
  }
}

export default function SystemLiquidityPanel() {
  const { user } = useAuthStore();
  const admin = isAdmin(user);
  const { data: wallets, isLoading } = useWallets();
  const allWallets: WalletType[] = wallets ?? [];

  if (!admin) {
    return (
      <div className="glass-panel p-8 text-center animate-fade-up">
        <AlertTriangle className="w-8 h-8 mx-auto mb-3" style={{ color: '#FF5252' }} />
        <p className="text-sm" style={{ color: '#FF5252' }}>Acesso Restrito</p>
        <p className="nex-mono text-xs mt-2" style={{ color: '#606060' }}>Disponível apenas para administradores.</p>
      </div>
    );
  }

  // Group by type
  const treasuryWallets = allWallets.filter((w) => w.type === 'treasury');
  const fxPoolWallets = allWallets.filter((w) => w.type === 'fx_pool');
  const feeWallets = allWallets.filter((w) => w.type === 'fee');
  const merchantWallets = allWallets.filter((w) => w.type === 'merchant');

  const treasuryTotal = treasuryWallets.reduce((s, w) => s + w.balance_available, 0);
  const fxPoolTotal = fxPoolWallets.reduce((s, w) => s + w.balance_available, 0);
  const feeTotal = feeWallets.reduce((s, w) => s + w.balance_available, 0);
  const merchantTotal = merchantWallets.reduce((s, w) => s + w.balance_available, 0);

  // Group all wallets by currency for breakdown
  const byCurrency = allWallets.reduce<Record<string, { total: number; available: number; clearing: number; count: number }>>(
    (acc, w) => {
      if (!acc[w.currency_code]) acc[w.currency_code] = { total: 0, available: 0, clearing: 0, count: 0 };
      acc[w.currency_code].total += w.balance_total;
      acc[w.currency_code].available += w.balance_available;
      acc[w.currency_code].clearing += w.balance_total - w.balance_available;
      acc[w.currency_code].count += 1;
      return acc;
    },
    {}
  );

  const totalSystemValue = Object.values(byCurrency).reduce((s, c) => s + c.available, 0);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 hover-lift">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.15)' }}>
              <Wallet className="w-4 h-4" style={{ color: '#00D4AA' }} />
            </div>
            <span className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#606060' }}>Tesouraria</span>
          </div>
          <p className="text-lg font-bold nex-mono" style={{ color: '#00D4AA' }}>
            {treasuryWallets.length > 0 ? fmt(treasuryTotal, treasuryWallets[0]?.currency_code || 'EUR') : '€0.00'}
          </p>
          <p className="nex-mono text-[10px]" style={{ color: '#606060' }}>{treasuryWallets.length} carteiras</p>
        </div>

        <div className="glass-panel p-5 hover-lift">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,180,216,0.08)', border: '1px solid rgba(0,180,216,0.15)' }}>
              <TrendingUp className="w-4 h-4" style={{ color: '#00B4D8' }} />
            </div>
            <span className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#606060' }}>FX Pool</span>
          </div>
          <p className="text-lg font-bold nex-mono" style={{ color: '#00B4D8' }}>
            {fxPoolWallets.length > 0 ? fmt(fxPoolTotal, fxPoolWallets[0]?.currency_code || 'EUR') : '€0.00'}
          </p>
          <p className="nex-mono text-[10px]" style={{ color: '#606060' }}>{fxPoolWallets.length} carteiras</p>
        </div>

        <div className="glass-panel p-5 hover-lift">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.15)' }}>
              <Coins className="w-4 h-4" style={{ color: '#FFB800' }} />
            </div>
            <span className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#606060' }}>Taxas</span>
          </div>
          <p className="text-lg font-bold nex-mono" style={{ color: '#FFB800' }}>
            {feeWallets.length > 0 ? fmt(feeTotal, feeWallets[0]?.currency_code || 'EUR') : '€0.00'}
          </p>
          <p className="nex-mono text-[10px]" style={{ color: '#606060' }}>{feeWallets.length} carteiras</p>
        </div>

        <div className="glass-panel p-5 hover-lift glow-box">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)' }}>
              <Droplets className="w-4 h-4" style={{ color: '#00D4AA' }} />
            </div>
            <span className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#606060' }}>Total Sistema</span>
          </div>
          <p className="text-lg font-bold nex-mono neon-glow" style={{ color: '#00D4AA' }}>
            ~{fmtShort(totalSystemValue)}
          </p>
          <p className="nex-mono text-[10px]" style={{ color: '#606060' }}>{Object.keys(byCurrency).length} moedas</p>
        </div>
      </div>

      {/* Full breakdown */}
      <div className="glass-panel overflow-hidden">
        <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <h3 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>Breakdown Completo por Moeda</h3>
          <p className="nex-mono text-[10px] mt-1" style={{ color: '#606060' }}>
            {allWallets.length} carteiras em {Object.keys(byCurrency).length} moedas
          </p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00D4AA', borderTopColor: 'transparent' }} />
            <p className="nex-mono text-xs mt-3" style={{ color: '#606060' }}>A carregar dados...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>Moeda</TableHead>
                  <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>Carteiras</TableHead>
                  <TableHead className="nex-mono text-[10px] uppercase text-right" style={{ color: '#606060' }}>Disponível</TableHead>
                  <TableHead className="nex-mono text-[10px] uppercase text-right" style={{ color: '#606060' }}>Total</TableHead>
                  <TableHead className="nex-mono text-[10px] uppercase text-right" style={{ color: '#606060' }}>Em Compensação</TableHead>
                  <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(byCurrency).map(([code, data]) => {
                  const clearingPct = data.total > 0 ? (data.clearing / data.total) * 100 : 0;
                  return (
                    <TableRow key={code} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} className="hover:bg-[rgba(0,212,170,0.02)] transition-colors">
                      <TableCell>
                        <span className="nex-mono text-sm font-bold" style={{ color: '#FFFFFF' }}>{code}</span>
                      </TableCell>
                      <TableCell>
                        <span className="nex-mono text-xs" style={{ color: '#A0A0A0' }}>{data.count}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="nex-mono text-xs font-semibold" style={{ color: '#00D4AA' }}>
                          {fmt(data.available, code)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="nex-mono text-xs" style={{ color: '#FFFFFF' }}>
                          {fmt(data.total, code)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="nex-mono text-xs" style={{ color: clearingPct > 20 ? '#FFB800' : '#A0A0A0' }}>
                            {fmt(data.clearing, code)}
                          </span>
                          {clearingPct > 0 && (
                            <div className="w-16 neon-progress-bar h-1">
                              <div className="neon-progress-fill amber" style={{ width: `${Math.min(clearingPct, 100)}%` }} />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className={`status-dot ${clearingPct > 50 ? 'warning' : 'active'}`} />
                          <span className="nex-mono text-[10px]" style={{ color: '#A0A0A0' }}>
                            {clearingPct > 50 ? 'Alta compensação' : clearingPct > 0 ? 'Compensando' : 'Líquido'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

function fmtShort(n: number): string {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `€${(n / 1_000).toFixed(1)}K`;
  return `€${n.toFixed(2)}`;
}
