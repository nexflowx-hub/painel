'use client';

import { useState } from 'react';
import { useStores, useCreateStore } from '@/hooks/use-wallets';
import { Store, Plus, ExternalLink, Copy, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

function StoreStatusBadge({ status }: { status: string }) {
  const isActive = status === 'active';
  return (
    <span
      className="inline-flex items-center gap-1.5 nex-mono text-[10px] px-2 py-0.5 rounded-md"
      style={{
        background: isActive ? 'rgba(0,212,170,0.08)' : 'rgba(255,82,82,0.08)',
        border: `1px solid ${isActive ? 'rgba(0,212,170,0.2)' : 'rgba(255,82,82,0.2)'}`,
        color: isActive ? '#00D4AA' : '#FF5252',
      }}
    >
      {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {isActive ? 'Ativa' : 'Inativa'}
    </span>
  );
}

function StoreRow({ store }: { store: { id: string; name: string; store_id: string; status: string; created_at: string } }) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(store.store_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.15)' }}
          >
            <Store className="w-5 h-5" style={{ color: '#00D4AA' }} />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold truncate" style={{ color: '#FFFFFF' }}>
              {store.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleCopyId}
                className="nex-mono text-[10px] flex items-center gap-1 transition-colors"
                style={{ color: '#606060' }}
                title="Copiar ID"
              >
                <Copy className="w-3 h-3" />
                {store.store_id.slice(0, 12)}...
              </button>
              {copied && (
                <span className="nex-mono text-[10px]" style={{ color: '#00D4AA' }}>Copiado!</span>
              )}
            </div>
            <p className="nex-mono text-[10px] mt-1" style={{ color: '#606060' }}>
              Criada em {new Date(store.created_at).toLocaleDateString('pt-PT')}
            </p>
          </div>
        </div>
        <StoreStatusBadge status={store.status} />
      </div>
    </div>
  );
}

export default function StoresPanel() {
  const { data: stores, isLoading } = useStores();
  const createStore = useCreateStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;
    try {
      await createStore.mutateAsync({ name: newStoreName.trim() });
      toast.success(`Loja "${newStoreName}" criada com sucesso`);
      setDialogOpen(false);
      setNewStoreName('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar loja');
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Lojas & Marcas</h2>
          <p className="nex-mono text-[10px] mt-0.5" style={{ color: '#606060' }}>
            Gestão Multi-Tenant · Isolamento de dados por loja
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 nex-mono text-[11px] uppercase tracking-wider font-semibold px-4 py-2.5 rounded-lg transition-all"
          style={{
            background: 'rgba(0,212,170,0.08)',
            border: '1px solid rgba(0,212,170,0.2)',
            color: '#00D4AA',
          }}
        >
          <Plus className="w-4 h-4" />
          Nova Loja
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl p-5" style={{ background: 'rgba(14,17,23,0.85)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <div className="flex-1">
                  <div className="h-4 w-32 rounded mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="h-3 w-48 rounded" style={{ background: 'rgba(255,255,255,0.03)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!stores || stores.length === 0) && (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl"
          style={{
            background: 'rgba(14,17,23,0.4)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <Store className="w-10 h-10 mb-3" style={{ color: '#333' }} />
          <p className="nex-mono text-sm" style={{ color: '#606060' }}>Nenhuma loja registada</p>
          <p className="nex-mono text-[10px] mt-1" style={{ color: '#444' }}>
            Crie a sua primeira loja para começar a aceitar pagamentos
          </p>
        </div>
      )}

      {/* Store list */}
      {!isLoading && stores && stores.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stores.map((store) => (
            <StoreRow key={store.id} store={store} />
          ))}
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
              Criar Nova Loja
            </DialogTitle>
            <DialogDescription className="nex-mono text-[11px]" style={{ color: '#606060' }}>
              Adicione uma nova loja ao seu merchant account
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div>
              <label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
                Nome da Loja
              </label>
              <Input
                type="text"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                placeholder="Ex: Loja Principal"
                className="mt-1.5 nex-mono"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#FFFFFF',
                }}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={createStore.isPending || !newStoreName.trim()}
              className="w-full nex-mono text-xs uppercase tracking-wider font-semibold"
              style={{ background: '#00D4AA', color: '#0F1117', border: 'none' }}
            >
              {createStore.isPending ? 'A criar...' : 'Criar Loja'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
