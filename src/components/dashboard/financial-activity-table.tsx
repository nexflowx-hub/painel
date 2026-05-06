'use client';

import { useState, useMemo } from 'react';
import { useLedger } from '@/hooks/use-wallets';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Filter, TrendingUp, Hash } from 'lucide-react';
import type { LedgerEntry, LedgerEntryType, LedgerEntryStatus } from '@/lib/api/contracts';

function fmt(n: number, code: string) {
  try {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: code, minimumFractionDigits: 2 }).format(n);
  } catch {
    return `${code} ${n.toFixed(2)}`;
  }
}

const typeBadgeMap: Record<string, string> = {
  PAYIN: 'neon-badge-teal',
  SWAP: 'neon-badge-cyan',
  PAYOUT: 'neon-badge-amber',
  FEE: 'neon-badge-red',
  REFUND: 'neon-badge-purple',
};

const statusDotMap: Record<string, string> = {
  cleared: 'active',
  pending: 'warning',
  failed: 'error',
};

export default function FinancialActivityTable() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading } = useLedger();
  const entries: LedgerEntry[] = data?.data ?? [];

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      return true;
    });
  }, [entries, typeFilter, statusFilter]);

  const totalVolume = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 text-center">
          <p className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#606060' }}>Total Entradas</p>
          <p className="text-lg font-bold nex-mono mt-1" style={{ color: '#FFFFFF' }}>{filtered.length}</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#606060' }}>Volume Total</p>
          <p className="text-lg font-bold nex-mono mt-1" style={{ color: '#00D4AA' }}>
            {filtered.length > 0 ? fmt(totalVolume, filtered[0]?.currency || 'EUR') : '€0.00'}
          </p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#606060' }}>Créditos</p>
          <p className="text-lg font-bold nex-mono mt-1" style={{ color: '#00D4AA' }}>
            {filtered.filter((e) => e.direction === 'CREDIT').length}
          </p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#606060' }}>Débitos</p>
          <p className="text-lg font-bold nex-mono mt-1" style={{ color: '#FF5252' }}>
            {filtered.filter((e) => e.direction === 'DEBIT').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4" style={{ color: '#A0A0A0' }} />
          <span className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>Filtros</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="nex-mono text-[10px]" style={{ color: '#606060' }}>Tipo:</span>
            <div className="flex gap-1.5">
              {['all', 'PAYIN', 'SWAP', 'PAYOUT', 'FEE', 'REFUND'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`neon-badge ${typeFilter === t ? 'neon-badge-teal' : ''} cursor-pointer transition-all`}
                  style={typeFilter !== t ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#606060' } : {}}
                >
                  {t === 'all' ? 'TODOS' : t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="nex-mono text-[10px]" style={{ color: '#606060' }}>Estado:</span>
            <div className="flex gap-1.5">
              {['all', 'pending', 'cleared', 'failed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`neon-badge cursor-pointer transition-all ${statusFilter === s ? (s === 'cleared' ? 'neon-badge-teal' : s === 'pending' ? 'neon-badge-amber' : 'neon-badge-red') : ''}`}
                  style={statusFilter !== s ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#606060' } : {}}
                >
                  {s === 'all' ? 'TODOS' : s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ledger">
        <TabsList className="glass-panel p-1 h-auto" style={{ background: 'rgba(14,19,27,0.65)' }}>
          <TabsTrigger
            value="ledger"
            className="data-[state=active]:text-[#00D4AA] data-[state=active]:bg-[rgba(0,212,170,0.08)] text-[#A0A0A0] nex-mono text-xs rounded-md px-4 py-2 transition-all"
          >
            <Hash className="w-3.5 h-3.5 mr-1.5" />
            Ledger
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="data-[state=active]:text-[#00D4AA] data-[state=active]:bg-[rgba(0,212,170,0.08)] text-[#A0A0A0] nex-mono text-xs rounded-md px-4 py-2 transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            Payment Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="mt-4">
          <div className="glass-panel overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00D4AA', borderTopColor: 'transparent' }} />
                <p className="nex-mono text-xs mt-3" style={{ color: '#606060' }}>A carregar ledger...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <p className="nex-mono text-xs" style={{ color: '#606060' }}>Nenhuma entrada encontrada.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>Estado</TableHead>
                      <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>Tipo</TableHead>
                      <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>Direção</TableHead>
                      <TableHead className="nex-mono text-[10px] uppercase text-right" style={{ color: '#606060' }}>Montante</TableHead>
                      <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>Descrição</TableHead>
                      <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>Referência</TableHead>
                      <TableHead className="nex-mono text-[10px] uppercase text-right" style={{ color: '#606060' }}>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((entry) => (
                      <TableRow
                        key={entry.id}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}
                        className="hover:bg-[rgba(0,212,170,0.02)] transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`status-dot ${statusDotMap[entry.status] || 'inactive'}`} />
                            <span className="nex-mono text-[10px] capitalize" style={{ color: '#A0A0A0' }}>{entry.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`neon-badge ${typeBadgeMap[entry.type] || 'neon-badge-teal'}`}>{entry.type}</span>
                        </TableCell>
                        <TableCell>
                          <span className="nex-mono text-xs" style={{ color: entry.direction === 'CREDIT' ? '#00D4AA' : '#FF5252' }}>
                            {entry.direction}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className="nex-mono text-xs font-semibold"
                            style={{ color: entry.direction === 'CREDIT' ? '#00D4AA' : '#FF5252' }}
                          >
                            {entry.direction === 'CREDIT' ? '+' : '-'}{fmt(entry.amount, entry.currency)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="nex-mono text-xs truncate block max-w-[200px]" style={{ color: '#A0A0A0' }}>
                            {entry.description || '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="nex-mono text-[10px]" style={{ color: '#606060' }}>
                            {entry.reference || '—'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="nex-mono text-[10px]" style={{ color: '#606060' }}>
                            {new Date(entry.created_at).toLocaleDateString('pt-PT')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <div className="glass-panel p-8 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-3" style={{ color: '#606060' }} />
            <p className="text-sm" style={{ color: '#A0A0A0' }}>Payment Events</p>
            <p className="nex-mono text-xs mt-2" style={{ color: '#606060' }}>
              Eventos de pagamento em tempo real serão exibidos aqui.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
