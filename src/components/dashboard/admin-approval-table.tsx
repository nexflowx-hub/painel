'use client';

import { useOperationTickets, useUpdateTicket } from '@/hooks/use-wallets';
import type { OperationTicket, TicketType, TicketStatus } from '@/types/atlas';
import { useAuthStore, isAdmin } from '@/lib/auth-store';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ShieldCheck, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const statusConfig: Record<TicketStatus, { dot: string; badge: string; color: string; label: string }> = {
  OPEN: { dot: 'warning', badge: 'neon-badge-amber', color: '#FFB800', label: 'Aberto' },
  IN_PROGRESS: { dot: 'warning', badge: 'neon-badge-cyan', color: '#00B4D8', label: 'Em Progresso' },
  RESOLVED: { dot: 'active', badge: 'neon-badge-teal', color: '#00D4AA', label: 'Resolvido' },
  REJECTED: { dot: 'error', badge: 'neon-badge-red', color: '#FF5252', label: 'Rejeitado' },
};

const typeLabels: Record<TicketType, string> = {
  MANUAL_WITHDRAWAL: 'Levantamento',
  TIER_UPGRADE: 'Upgrade Nível',
  FEE_ADJUSTMENT: 'Ajuste Taxa',
  SUPPORT: 'Suporte',
};

function TypeBadge({ type }: { type: TicketType }) {
  return <span className="neon-badge neon-badge-cyan">{typeLabels[type] || type}</span>;
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const cfg = statusConfig[status];
  return (
    <div className="flex items-center gap-2">
      <span className={`status-dot ${cfg.dot}`} />
      <span className={`neon-badge ${cfg.badge}`}>{cfg.label}</span>
    </div>
  );
}

export default function AdminApprovalTable() {
  const { user } = useAuthStore();
  const admin = isAdmin(user);
  const ticketsQuery = useOperationTickets();
  const updateTicketMut = useUpdateTicket();

  if (!admin) {
    return (
      <div className="glass-panel p-8 text-center animate-fade-up">
        <AlertTriangle className="w-8 h-8 mx-auto mb-3" style={{ color: '#FF5252' }} />
        <p className="text-sm" style={{ color: '#FF5252' }}>Acesso Restrito</p>
        <p className="nex-mono text-xs mt-2" style={{ color: '#606060' }}>Esta secção está disponível apenas para administradores.</p>
      </div>
    );
  }

  const allTickets: OperationTicket[] = ticketsQuery.data?.data ?? [];
  const isLoading = ticketsQuery.isLoading;
  const openCount = allTickets.filter((t) => t.status === 'OPEN').length;

  const handleResolve = async (id: string) => {
    try {
      await updateTicketMut.mutateAsync({ id, status: 'RESOLVED' });
    } catch {
      // handled by mutation
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateTicketMut.mutateAsync({ id, status: 'REJECTED' });
    } catch {
      // handled by mutation
    }
  };

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 text-center">
          <p className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#606060' }}>Total</p>
          <p className="text-lg font-bold nex-mono mt-1" style={{ color: '#FFFFFF' }}>{allTickets.length}</p>
        </div>
        <div className="glass-panel p-4 text-center glow-box-subtle">
          <p className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#606060' }}>Abertos</p>
          <p className="text-lg font-bold nex-mono mt-1" style={{ color: '#FFB800' }}>{openCount}</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#606060' }}>Resolvidos</p>
          <p className="text-lg font-bold nex-mono mt-1" style={{ color: '#00D4AA' }}>
            {allTickets.filter((t) => t.status === 'RESOLVED').length}
          </p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#606060' }}>Rejeitados</p>
          <p className="text-lg font-bold nex-mono mt-1" style={{ color: '#FF5252' }}>
            {allTickets.filter((t) => t.status === 'REJECTED').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00D4AA', borderTopColor: 'transparent' }} />
            <p className="nex-mono text-xs mt-3" style={{ color: '#606060' }}>A carregar tickets...</p>
          </div>
        ) : allTickets.length === 0 ? (
          <div className="p-8 text-center">
            <ShieldCheck className="w-8 h-8 mx-auto mb-3" style={{ color: '#606060' }} />
            <p className="nex-mono text-xs" style={{ color: '#606060' }}>Sem tickets de operação pendentes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>ID</TableHead>
                  <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>Tipo</TableHead>
                  <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>Descrição</TableHead>
                  <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>Criador</TableHead>
                  <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>Destinatário</TableHead>
                  <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>Estado</TableHead>
                  <TableHead className="nex-mono text-[10px] uppercase text-right" style={{ color: '#606060' }}>Data</TableHead>
                  <TableHead className="nex-mono text-[10px] uppercase text-right" style={{ color: '#606060' }}>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allTickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}
                    className="hover:bg-[rgba(0,212,170,0.02)] transition-colors"
                  >
                    <TableCell>
                      <span className="nex-mono text-[10px]" style={{ color: '#606060' }}>
                        #{ticket.id.slice(-8)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <TypeBadge type={ticket.type} />
                    </TableCell>
                    <TableCell>
                      <span className="nex-mono text-xs truncate max-w-[200px] block" style={{ color: '#A0A0A0' }} title={ticket.description}>
                        {ticket.description || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="nex-mono text-xs" style={{ color: '#FFFFFF' }}>
                        {ticket.creator?.email || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="nex-mono text-xs" style={{ color: '#FFFFFF' }}>
                        {ticket.targetUser?.nickname || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="nex-mono text-[10px]" style={{ color: '#606060' }}>
                        {new Date(ticket.createdAt).toLocaleDateString('pt-PT')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleReject(ticket.id)}
                            disabled={updateTicketMut.isPending}
                            className="px-2.5 py-1.5 rounded-md text-[10px] flex items-center gap-1 border transition-colors disabled:opacity-40"
                            style={{ borderColor: '#FF5252', color: '#FF5252' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,82,82,0.1)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            {updateTicketMut.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            Rejeitar
                          </button>
                          <button
                            onClick={() => handleResolve(ticket.id)}
                            disabled={updateTicketMut.isPending}
                            className="neon-btn-primary px-3 py-1.5 rounded-md text-[10px] flex items-center gap-1 disabled:opacity-40"
                          >
                            {updateTicketMut.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            Resolver
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
