'use client';

import { useState } from 'react';
import { useGateways, useConfigureGateway } from '@/hooks/use-wallets';
import { Plug, Settings2, CheckCircle2, XCircle, Shield, Eye, EyeOff, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const gatewayMeta: Record<string, { color: string; description: string; icon: string }> = {
  stripe: { color: '#635BFF', description: 'Stripe Connect — Cartões, SEPA, Apple Pay', icon: '💳' },
  sumup: { color: '#FF6E00', description: 'SumUp — Terminal POS + Online', icon: '🏪' },
  mistic: { color: '#00D4AA', description: 'Mistic — PIX, QR Code, BRL', icon: '⚡' },
  manual: { color: '#A0A0A0', description: 'Gateway manual / Bank Transfer', icon: '🏦' },
};

function getMeta(type: string) {
  const t = type.toLowerCase();
  if (t.includes('stripe')) return gatewayMeta.stripe;
  if (t.includes('sumup')) return gatewayMeta.sumup;
  if (t.includes('mistic')) return gatewayMeta.mistic;
  return gatewayMeta.manual;
}

function GatewayCard({ gateway }: { gateway: { id: string; name: string; type: string; is_active: boolean; created_at: string } }) {
  const meta = getMeta(gateway.type);
  const [showConfig, setShowConfig] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const configureMutation = useConfigureGateway();

  const handleSave = async () => {
    try {
      await configureMutation.mutateAsync({
        gateway_id: gateway.id,
        config: { secret_key: secretKey, public_key: publicKey },
      });
      toast.success(`Gateway ${gateway.name} atualizado`);
      setShowConfig(false);
      setSecretKey('');
      setPublicKey('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao configurar gateway');
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-xl transition-all hover-lift"
      style={{
        background: 'rgba(14,17,23,0.85)',
        border: `1px solid ${gateway.is_active ? `${meta.color}15` : 'rgba(255,255,255,0.05)'}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${meta.color}40, transparent)` }}
      />

      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: `${meta.color}0D`, border: `1px solid ${meta.color}1A` }}
            >
              {meta.icon}
            </div>
            <div>
              <h4 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>{gateway.name}</h4>
              <p className="nex-mono text-[10px]" style={{ color: '#606060' }}>{gateway.type.toUpperCase()}</p>
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 nex-mono text-[10px] px-2 py-0.5 rounded-md"
            style={{
              background: gateway.is_active ? 'rgba(0,212,170,0.08)' : 'rgba(255,82,82,0.08)',
              border: `1px solid ${gateway.is_active ? 'rgba(0,212,170,0.2)' : 'rgba(255,82,82,0.2)'}`,
              color: gateway.is_active ? '#00D4AA' : '#FF5252',
            }}
          >
            {gateway.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {gateway.is_active ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <p className="nex-mono text-[10px] mb-4" style={{ color: '#A0A0A0' }}>{meta.description}</p>

        {/* Config Panel (inline) */}
        {showConfig && (
          <div className="space-y-3 mb-4 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="nex-mono text-[9px] uppercase tracking-widest" style={{ color: '#606060' }}>
              <Shield className="w-3 h-3 inline mr-1" />
              Chaves AES-256 Encriptadas
            </p>
            <div>
              <Label className="nex-mono text-[10px]" style={{ color: '#A0A0A0' }}>Secret Key</Label>
              <div className="relative mt-1">
                <Input
                  type={showSecret ? 'text' : 'password'}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="sk_live_..."
                  className="nex-mono text-xs pr-9"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  {showSecret ? <EyeOff className="w-3.5 h-3.5" style={{ color: '#606060' }} /> : <Eye className="w-3.5 h-3.5" style={{ color: '#606060' }} />}
                </button>
              </div>
            </div>
            <div>
              <Label className="nex-mono text-[10px]" style={{ color: '#A0A0A0' }}>Public Key</Label>
              <Input
                type="text"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="pk_live_..."
                className="nex-mono text-xs mt-1"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={configureMutation.isPending}
                className="nex-mono text-[10px] uppercase tracking-wider font-semibold flex-1"
                style={{ background: meta.color, color: '#FFFFFF', border: 'none' }}
              >
                {configureMutation.isPending ? 'A guardar...' : 'Guardar'}
              </Button>
              <Button
                onClick={() => setShowConfig(false)}
                variant="outline"
                className="nex-mono text-[10px]"
                style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: '#606060' }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {!showConfig && (
          <button
            onClick={() => setShowConfig(true)}
            className="flex items-center gap-2 nex-mono text-[10px] uppercase tracking-wider font-semibold px-3 py-2 rounded-lg transition-all"
            style={{
              background: `${meta.color}0D`,
              border: `1px solid ${meta.color}1A`,
              color: meta.color,
            }}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Configurar
          </button>
        )}
      </div>
    </div>
  );
}

export default function GatewaysPanel() {
  const { data: gateways, isLoading } = useGateways();

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Gateways & API</h2>
        <p className="nex-mono text-[10px] mt-0.5" style={{ color: '#606060' }}>
          Configuração de provedores de pagamento · Chaves encriptadas AES-256
        </p>
      </div>

      {/* Info Banner */}
      <div
        className="p-4 rounded-xl flex items-start gap-3"
        style={{
          background: 'rgba(0,212,170,0.04)',
          border: '1px solid rgba(0,212,170,0.1)',
        }}
      >
        <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#00D4AA' }} />
        <div>
          <p className="text-xs font-medium" style={{ color: '#FFFFFF' }}>Segurança de Chaves</p>
          <p className="nex-mono text-[10px] mt-0.5" style={{ color: '#606060' }}>
            Todas as chaves são encriptadas com AES-256 antes do armazenamento. As credenciais dos provedores (Stripe, SumUp, Mistic) são protegidas em repouso.
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl p-5" style={{ background: 'rgba(14,17,23,0.85)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <div className="flex-1">
                  <div className="h-4 w-24 rounded mb-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="h-3 w-16 rounded" style={{ background: 'rgba(255,255,255,0.03)' }} />
                </div>
              </div>
              <div className="h-3 w-full rounded" style={{ background: 'rgba(255,255,255,0.03)' }} />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!gateways || gateways.length === 0) && (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl"
          style={{ background: 'rgba(14,17,23,0.4)', border: '1px solid rgba(255,255,255,0.04)' }}
        >
          <Plug className="w-10 h-10 mb-3" style={{ color: '#333' }} />
          <p className="nex-mono text-sm" style={{ color: '#606060' }}>Nenhum gateway configurado</p>
          <p className="nex-mono text-[10px] mt-1" style={{ color: '#444' }}>
            Configure um provedor de pagamento para começar a receber
          </p>
        </div>
      )}

      {/* Gateway Cards */}
      {!isLoading && gateways && gateways.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gateways.map((gw) => (
            <GatewayCard key={gw.id} gateway={gw} />
          ))}
        </div>
      )}
    </div>
  );
}
