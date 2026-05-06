'use client';

import { useState } from 'react';
import { usePaymentLinks, useCreatePaymentLink, useStores } from '@/hooks/use-wallets';
import { Link2, Plus, Copy, CheckCircle2, ExternalLink, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

function fmt(n: number, code: string) {
  try {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: code, minimumFractionDigits: 2 }).format(n);
  } catch {
    return `${code} ${n.toFixed(2)}`;
  }
}

function LinkStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { color: string; label: string }> = {
    active: { color: '#00D4AA', label: 'Ativo' },
    paid: { color: '#00B4D8', label: 'Pago' },
    expired: { color: '#FF5252', label: 'Expirado' },
    cancelled: { color: '#606060', label: 'Cancelado' },
  };
  const cfg = configs[status] || { color: '#A0A0A0', label: status };
  return (
    <span
      className="nex-mono text-[10px] px-2 py-0.5 rounded-md"
      style={{
        background: `${cfg.color}0D`,
        border: `1px solid ${cfg.color}20`,
        color: cfg.color,
      }}
    >
      {cfg.label}
    </span>
  );
}

function PaymentLinkRow({ link }: { link: { id: string; amount: number; currency: string; status: string; shareable_url?: string; store_name?: string; customer_email?: string; created_at: string; expires_at?: string } }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (link.shareable_url) {
      navigator.clipboard.writeText(link.shareable_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="p-4 md:p-5 rounded-xl transition-all hover-lift"
      style={{
        background: 'rgba(14,17,23,0.85)',
        border: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(0,180,216,0.08)', border: '1px solid rgba(0,180,216,0.15)' }}
          >
            <Link2 className="w-5 h-5" style={{ color: '#00B4D8' }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="nex-mono text-base font-bold" style={{ color: '#FFFFFF' }}>
                {fmt(link.amount, link.currency)}
              </span>
              <LinkStatusBadge status={link.status} />
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {link.store_name && (
                <span className="nex-mono text-[10px]" style={{ color: '#606060' }}>
                  🏪 {link.store_name}
                </span>
              )}
              <span className="nex-mono text-[10px]" style={{ color: '#606060' }}>
                <Clock className="w-3 h-3 inline mr-1" />
                {new Date(link.created_at).toLocaleDateString('pt-PT')}
              </span>
            </div>
            {link.customer_email && (
              <p className="nex-mono text-[10px] mt-1" style={{ color: '#A0A0A0' }}>
                {link.customer_email}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {link.shareable_url && (
            <>
              <button
                onClick={handleCopy}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                title="Copiar link"
              >
                <Copy className="w-3.5 h-3.5" style={{ color: copied ? '#00D4AA' : '#606060' }} />
              </button>
              <a
                href={link.shareable_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                title="Abrir link"
              >
                <ExternalLink className="w-3.5 h-3.5" style={{ color: '#606060' }} />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentLinksPanel() {
  const { data: links, isLoading } = usePaymentLinks();
  const { data: stores } = useStores();
  const createLink = useCreatePaymentLink();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [storeId, setStoreId] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    try {
      await createLink.mutateAsync({
        amount: Number(amount),
        currency,
        store_id: storeId || undefined,
        customer_email: customerEmail || undefined,
      });
      toast.success('Link de pagamento criado com sucesso');
      setDialogOpen(false);
      setAmount('');
      setCustomerEmail('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar link');
    }
  };

  const activeLinks = (links ?? []).filter((l) => l.status === 'active');
  const otherLinks = (links ?? []).filter((l) => l.status !== 'active');

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Links de Pagamento</h2>
          <p className="nex-mono text-[10px] mt-0.5" style={{ color: '#606060' }}>
            Checkout links ativos · {activeLinks.length} ativo{activeLinks.length !== 1 ? 's' : ''} de {(links ?? []).length} total
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 nex-mono text-[11px] uppercase tracking-wider font-semibold px-4 py-2.5 rounded-lg transition-all"
          style={{
            background: 'rgba(0,180,216,0.08)',
            border: '1px solid rgba(0,180,216,0.2)',
            color: '#00B4D8',
          }}
        >
          <Plus className="w-4 h-4" />
          Novo Link
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl p-5" style={{ background: 'rgba(14,17,23,0.85)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <div className="flex-1">
                  <div className="h-5 w-28 rounded mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="h-3 w-48 rounded" style={{ background: 'rgba(255,255,255,0.03)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!links || links.length === 0) && (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl"
          style={{ background: 'rgba(14,17,23,0.4)', border: '1px solid rgba(255,255,255,0.04)' }}
        >
          <Link2 className="w-10 h-10 mb-3" style={{ color: '#333' }} />
          <p className="nex-mono text-sm" style={{ color: '#606060' }}>Nenhum link de pagamento</p>
          <p className="nex-mono text-[10px] mt-1" style={{ color: '#444' }}>
            Crie o seu primeiro checkout link
          </p>
        </div>
      )}

      {/* Active Links */}
      {!isLoading && activeLinks.length > 0 && (
        <div>
          <p className="nex-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: '#606060' }}>
            Ativos ({activeLinks.length})
          </p>
          <div className="space-y-3">
            {activeLinks.map((link) => (
              <PaymentLinkRow key={link.id} link={link} />
            ))}
          </div>
        </div>
      )}

      {/* Other Links */}
      {!isLoading && otherLinks.length > 0 && (
        <div>
          <p className="nex-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: '#606060' }}>
            Histórico ({otherLinks.length})
          </p>
          <div className="space-y-3 max-h-64 overflow-y-auto cyber-scrollbar">
            {otherLinks.map((link) => (
              <PaymentLinkRow key={link.id} link={link} />
            ))}
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="sm:max-w-md"
          style={{ background: '#14171E', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <DialogHeader>
            <DialogTitle className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
              Novo Link de Pagamento
            </DialogTitle>
            <DialogDescription className="nex-mono text-[11px]" style={{ color: '#606060' }}>
              Gere um checkout link para cobrar um cliente
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
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
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
                  required
                />
              </div>
              <div>
                <Label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                  Moeda
                </Label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1.5 w-full nex-mono text-sm rounded-lg px-3 py-2"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF', outline: 'none' }}
                >
                  <option value="EUR">EUR</option>
                  <option value="BRL">BRL</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>
            </div>

            {stores && stores.length > 0 && (
              <div>
                <Label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                  Loja (Opcional)
                </Label>
                <select
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="mt-1.5 w-full nex-mono text-sm rounded-lg px-3 py-2"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF', outline: 'none' }}
                >
                  <option value="">Nenhuma</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.store_id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                Email do Cliente (Opcional)
              </Label>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="mt-1.5 nex-mono"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
              />
            </div>

            <Button
              type="submit"
              disabled={createLink.isPending || !amount}
              className="w-full nex-mono text-xs uppercase tracking-wider font-semibold"
              style={{ background: '#00B4D8', color: '#0F1117', border: 'none' }}
            >
              {createLink.isPending ? 'A criar...' : 'Gerar Link de Pagamento'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
