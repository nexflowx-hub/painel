'use client';

import { useActionTickets, useApproveTicket } from '@/hooks/use-wallets';
import { useAuthStore, isAdmin } from '@/lib/auth-store';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ShieldCheck, Loader2, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import type { ActionTicket, ActionTicketStatus } from '@/lib/api/contracts';

const statusConfig: Record<ActionTicketStatus, { dot: string; badge: string; color: string; label: string }> = {
  pending_review: { dot: 'warning', badge: 'neon-badge-amber', color: '#FFB800', label: 'Pendente' },
  approved: { dot: 'active', badge: 'neon-badge-teal', color: '#00D4AA', label: 'Aprovado' },
  rejected: { dot: 'error', badge: 'neon-badge-red', color: '#FF5252', label: 'Rejeitado' },
  processing: { dot: 'warning', badge: 'neon-badge-cyan', color: '#00B4D8', label: 'Em Processo' },
};

export default function AdminApprovalTable() {
  const { user } = useAuthStore();
  const admin = isAdmin(user);
  const { data: tickets, isLoading } = useActionTickets();
  const approveMut = useApproveTicket();

  if (!admin) {
    return (
      <div className="glass-panel p-8 text-center animate-fade-up">
        <AlertTriangle className="w-8 h-8 mx-auto mb-3" style={{ color: '#FF5252' }} />
        <p className="text-sm" style={{ color: '#FF5252' }}>Acesso Restrito</p>
        <p className="nex-mono text-xs mt-2" style={{ color: '#606060' }}>Esta secção está disponível apenas para administradores.</p>
      </div>
    );
  }

  const allTickets: ActionTicket[] = tickets ?? [];
  const pendingCount = allTickets.filter((t) => t.status === 'pending_review').length;

  const handleApprove = async (id: string) => {
    try {
      await approveMut.mutateAsync(id);
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
          <p className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#606060' }}>Pendentes</p>
          <p className="text-lg font-bold nex-mono mt-1" style={{ color: '#FFB800' }}>{pendingCount}</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#606060' }}>Aprovados</p>
          <p className="text-lg font-bold nex-mono mt-1" style={{ color: '#00D4AA' }}>
            {allTickets.filter((t) => t.status === 'approved').length}
          </p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#606060' }}>Rejeitados</p>
          <p className="text-lg font-bold nex-mono mt-1" style={{ color: '#FF5252' }}>
            {allTickets.filter((t) => t.status === 'rejected').length}
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
            <p className="nex-mono text-xs" style={{ color: '#606060' }}>Sem tickets de aprovação pendentes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>ID</TableHead>
                  <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>Tipo</TableHead>
                  <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>Prioridade</TableHead>
                  <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>Merchant</TableHead>
                  <TableHead className="nex-mono text-[10px] uppercase" style={{ color: '#606060' }}>Estado</TableHead>
                  <TableHead className="nex-mono text-[10px] uppercase text-right" style={{ color: '#606060' }}>Data</TableHead>
                  <TableHead className="nex-mono text-[10px] uppercase text-right" style={{ color: '#606060' }}>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allTickets.map((ticket) => {
                  const cfg = statusConfig[ticket.status];
                  return (
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
                        <span className="neon-badge neon-badge-cyan">{ticket.type || '—'}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`nex-mono text-xs ${ticket.priority === 'high' ? 'neon-glow-red' : ''}`} style={{ color: ticket.priority === 'high' ? '#FF5252' : '#A0A0A0' }}>
                          {ticket.priority || 'normal'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="nex-mono text-xs" style={{ color: '#FFFFFF' }}>
                          {ticket.merchant?.username || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`status-dot ${cfg.dot}`} />
                          <span className={`neon-badge ${cfg.badge}`}>{cfg.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="nex-mono text-[10px]" style={{ color: '#606060' }}>
                          {new Date(ticket.created_at).toLocaleDateString('pt-PT')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {ticket.status === 'pending_review' && (
                          <button
                            onClick={() => handleApprove(ticket.id)}
                            disabled={approveMut.isPending}
                            className="neon-btn-primary px-3 py-1.5 rounded-md text-[10px] flex items-center gap-1 ml-auto disabled:opacity-40"
                          >
                            {approveMut.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            Aprovar
                          </button>
                        )}
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
