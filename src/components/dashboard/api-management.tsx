'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, isAdmin, isCustomer } from '@/lib/auth-store';
import { merchantApi, type MerchantApiKey, type MerchantApiKeyCreated } from '@/lib/api/atlas-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Code2, Key, Webhook, BookOpen, Lock, Plus, Eye, EyeOff, Copy,
  CheckCircle, Loader2, ExternalLink, Shield, ArrowRight, RefreshCw,
} from 'lucide-react';

export default function ApiManagement() {
  const { user } = useAuthStore();
  const customer = isCustomer(user);

  if (customer) {
    return <LockedState />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.15)' }}>
            <Code2 className="w-5 h-5" style={{ color: '#00D4AA' }} />
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>Developer / API Hub</h3>
            <p className="nex-mono text-[10px]" style={{ color: '#606060' }}>Gestão de chaves API, webhooks e documentação.</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="keys">
        <TabsList className="glass-panel p-1 h-auto w-full grid grid-cols-4" style={{ background: 'rgba(14,19,27,0.65)' }}>
          {[
            { value: 'keys', label: 'API Keys', icon: Key },
            { value: 'webhooks', label: 'Webhooks', icon: Webhook },
            { value: 'getting-started', label: 'Getting Started', icon: ArrowRight },
            { value: 'reference', label: 'API Reference', icon: BookOpen },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:text-[#00D4AA] data-[state=active]:bg-[rgba(0,212,170,0.08)] text-[#A0A0A0] nex-mono text-[10px] rounded-md px-2 py-2.5 transition-all flex items-center justify-center gap-1.5"
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="keys" className="mt-4">
          <ApiKeysTab />
        </TabsContent>
        <TabsContent value="webhooks" className="mt-4">
          <WebhooksTab />
        </TabsContent>
        <TabsContent value="getting-started" className="mt-4">
          <GettingStartedTab />
        </TabsContent>
        <TabsContent value="reference" className="mt-4">
          <ApiReferenceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─── Locked State ─── */
function LockedState() {
  return (
    <div className="max-w-lg mx-auto animate-fade-up">
      <div className="glass-panel p-8 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}
        >
          <Lock className="w-8 h-8" style={{ color: '#A855F7' }} />
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#FFFFFF' }}>API Access Locked</h3>
        <p className="nex-mono text-xs mb-6" style={{ color: '#A0A0A0' }}>
          O acesso à API está disponível apenas para contas Merchant e Admin. Faça upgrade para aceder a integrações avançadas.
        </p>
        <button
          className="neon-btn-primary px-6 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 mx-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(168,85,247,0.06))',
            borderColor: 'rgba(168,85,247,0.35)',
            color: '#A855F7',
          }}
        >
          <Shield className="w-4 h-4" />
          Solicitar Upgrade
        </button>
        <div className="mt-6 grid grid-cols-2 gap-4 text-left">
          {[
            { title: 'REST API', desc: 'Endpoints completos para integração.' },
            { title: 'Webhooks', desc: 'Notificações em tempo real.' },
            { title: 'API Keys', desc: 'Gestão segura de credenciais.' },
            { title: 'Sandbox', desc: 'Ambiente de testes incluso.' },
          ].map((f) => (
            <div key={f.title} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-xs font-medium" style={{ color: '#FFFFFF' }}>{f.title}</p>
              <p className="nex-mono text-[10px]" style={{ color: '#606060' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── API Keys Tab ─── */
function ApiKeysTab() {
  const [keys, setKeys] = useState<MerchantApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyData, setNewKeyData] = useState<MerchantApiKeyCreated | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadKeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await merchantApi.listApiKeys();
      setKeys(Array.isArray(data) ? data : []);
    } catch {
      setKeys([]);
      setError('Erro ao carregar chaves API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadKeys(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const data = await merchantApi.generateApiKey('Atlas Core API Key');
      if (data?.key) {
        setNewKeyData(data);
        loadKeys();
      }
    } catch {
      setError('Erro ao gerar chave API. Tente novamente.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>Chaves API</h4>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="neon-btn-primary px-4 py-2 rounded-lg text-xs flex items-center gap-2 disabled:opacity-40"
        >
          {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Criar Nova Chave
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg mb-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <p className="nex-mono text-[10px]" style={{ color: '#EF4444' }}>{error}</p>
        </div>
      )}

      {/* New key reveal (shown once) */}
      {newKeyData && (
        <div className="p-4 rounded-lg mb-4" style={{ background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.15)' }}>
          <p className="nex-mono text-[10px] uppercase tracking-wider mb-2" style={{ color: '#00D4AA' }}>
            ⚠️ Nova Chave API (guarde em segurança — não será mostrada novamente)
          </p>
          <div className="flex items-center gap-2">
            <code className="nex-mono text-xs flex-1 break-all" style={{ color: '#FFFFFF' }}>{newKeyData.key}</code>
            <button onClick={() => handleCopy(newKeyData.key)} className="p-2 rounded hover:bg-white/5 transition-colors" style={{ color: '#00D4AA' }}>
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Keys list */}
      {loading ? (
        <div className="p-4 text-center">
          <div className="inline-block w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00D4AA', borderTopColor: 'transparent' }} />
        </div>
      ) : keys.length === 0 ? (
        <p className="nex-mono text-xs text-center py-4" style={{ color: '#606060' }}>Nenhuma chave API criada.</p>
      ) : (
        <div className="space-y-2">
          {keys.map((apiKey) => (
            <div
              key={apiKey.id}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="flex items-center gap-3">
                <Key className="w-4 h-4" style={{ color: '#00D4AA' }} />
                <div>
                  <p className="nex-mono text-xs" style={{ color: '#FFFFFF' }}>
                    {apiKey.key_prefix}
                  </p>
                  <p className="nex-mono text-[10px]" style={{ color: '#606060' }}>
                    Criada: {new Date(apiKey.created_at).toLocaleDateString('pt-PT')}
                    {apiKey.label && ` · ${apiKey.label}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {apiKey.last_used_at && (
                  <span className="nex-mono text-[10px] hidden sm:inline" style={{ color: '#606060' }}>
                    Último uso: {new Date(apiKey.last_used_at).toLocaleDateString('pt-PT')}
                  </span>
                )}
                <span className={`status-dot ${apiKey.is_active ? 'active' : 'inactive'}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Webhooks Tab ─── */
function WebhooksTab() {
  return (
    <div className="space-y-4">
      <div className="glass-panel p-6">
        <h4 className="text-sm font-semibold mb-4" style={{ color: '#FFFFFF' }}>Configuração de Webhook</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>Webhook URL</label>
            <input
              type="url"
              className="neon-input w-full rounded-lg px-4 py-3 text-sm nex-mono"
              placeholder="https://seu-servidor.com/webhook/atlasgp"
            />
          </div>
          <div className="space-y-2">
            <label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>HMAC Secret</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="neon-input flex-1 rounded-lg px-4 py-3 text-sm nex-mono"
                placeholder="atlasgp_whsec_••••••••"
                defaultValue=""
                readOnly
              />
            </div>
          </div>
          <button className="neon-btn-primary px-4 py-2.5 rounded-lg text-sm">Guardar Configuração</button>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h4 className="text-sm font-semibold mb-4" style={{ color: '#FFFFFF' }}>Eventos Disponíveis</h4>
        <div
          className="p-4 rounded-lg text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
        >
          <p className="nex-mono text-xs" style={{ color: '#A0A0A0' }}>
            Configuração de eventos de webhook disponível via API.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Getting Started Tab ─── */
function GettingStartedTab() {
  const steps = [
    { num: '01', title: 'Criar Chave API', desc: 'Gere uma chave API na secção "API Keys". Guarde a chave em segurança.' },
    { num: '02', title: 'Configurar Webhook', desc: 'Defina a URL do seu servidor para receber notificações em tempo real.' },
    { num: '03', title: 'Testar no Sandbox', desc: 'Utilize o ambiente de testes para validar a sua integração antes de ir para produção.' },
    { num: '04', title: 'Implementar Endpoints', desc: 'Integre os endpoints de pagamento, câmbio e levantamento na sua aplicação.' },
    { num: '05', title: 'Go Live', desc: 'Após validação, ative a sua integração em produção.' },
  ];

  return (
    <div className="glass-panel p-6">
      <h4 className="text-sm font-semibold mb-6" style={{ color: '#FFFFFF' }}>Guia de Início Rápido</h4>
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={step.num} className="flex gap-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 nex-mono text-sm font-bold"
              style={{
                background: 'rgba(0,212,170,0.06)',
                border: '1px solid rgba(0,212,170,0.15)',
                color: '#00D4AA',
              }}
            >
              {step.num}
            </div>
            <div className="flex-1 pb-4" style={{ borderBottom: i < steps.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
              <p className="text-sm font-medium mb-1" style={{ color: '#FFFFFF' }}>{step.title}</p>
              <p className="nex-mono text-xs" style={{ color: '#A0A0A0' }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── API Reference Tab ─── */
function ApiReferenceTab() {
  const { user } = useAuthStore();
  const admin = isAdmin(user);

  const endpoints = [
    { method: 'GET', path: '/wallets', desc: 'Listar carteiras', color: '#00B4D8' },
    { method: 'POST', path: '/swaps', desc: 'Executar câmbio', color: '#FFB800' },
    { method: 'POST', path: '/payouts', desc: 'Solicitar levantamento', color: '#FFB800' },
    { method: 'POST', path: '/deposits', desc: 'Criar depósito', color: '#00D4AA' },
    { method: 'GET', path: '/api/internal/links', desc: 'Listar smart links', color: '#00B4D8' },
    { method: 'POST', path: '/api/internal/links', desc: 'Criar smart link', color: '#00D4AA' },
    { method: 'GET', path: '/api/internal/stores', desc: 'Config da loja', color: '#00B4D8' },
    { method: 'GET', path: '/api/merchant/api-keys', desc: 'Listar chaves API', color: '#00B4D8' },
    { method: 'POST', path: '/api/merchant/api-keys/generate', desc: 'Gerar chave API', color: '#00D4AA' },
    { method: 'GET', path: '/api/public/rates', desc: 'Taxas de câmbio', color: '#00B4D8' },
    { method: 'GET', path: '/ledger', desc: 'Consultar ledger', color: '#00B4D8' },
    { method: 'GET', path: '/auth/me', desc: 'Obter perfil do utilizador', color: '#A855F7' },
    ...(admin ? [
      { method: 'GET', path: '/admin/users', desc: 'Listar utilizadores (Admin)', color: '#FFB800' },
      { method: 'GET', path: '/admin/tickets', desc: 'Listar tickets de aprovação (Admin)', color: '#FFB800' },
    ] : []),
  ];

  return (
    <div className="glass-panel overflow-hidden">
      <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        <h4 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>API Reference</h4>
        <p className="nex-mono text-[10px] mt-1" style={{ color: '#606060' }}>Base URL: api.atlasglobal.digital/api/v1</p>
      </div>
      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.02)' }}>
        {endpoints.map((ep) => (
          <div
            key={`${ep.method}-${ep.path}`}
            className="flex items-center gap-3 px-5 py-3 hover:bg-[rgba(0,212,170,0.02)] transition-colors"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}
          >
            <span
              className="nex-mono text-[10px] font-bold px-2 py-1 rounded min-w-[50px] text-center"
              style={{ background: `${ep.color}10`, color: ep.color, border: `1px solid ${ep.color}25` }}
            >
              {ep.method}
            </span>
            <code className="nex-mono text-xs flex-1" style={{ color: '#FFFFFF' }}>{ep.path}</code>
            <span className="nex-mono text-[10px] hidden sm:block" style={{ color: '#606060' }}>{ep.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
