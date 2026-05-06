'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Store, Link2, Users, Plus, Copy, Check, ExternalLink,
  Palette, Phone, FileText, ShoppingCart, Eye,
  TrendingUp, Clock, Mail, Hash,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  StoreCheckout, StoreCheckoutConfig, SmartPaymentLink, CheckoutCustomer,
} from '@/types/atlas';
import { useCheckoutStore, useSmartPaymentLinks, useCreatePaymentLink, useCustomers } from '@/hooks/use-merchant';

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

function fmt(n: number, code: string) {
  try {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${code} ${n.toFixed(2)}`;
  }
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="nex-mono text-[10px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
      style={{
        background: copied ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${copied ? 'rgba(0,212,170,0.25)' : 'rgba(255,255,255,0.06)'}`,
        color: copied ? '#00D4AA' : '#606060',
      }}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copiado!' : (label || 'Copiar')}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   MOCK DATA — used when hooks return empty (DEV_MOCK mode)
   ═══════════════════════════════════════════════════════════ */

const MOCK_STORE: StoreCheckout = {
  id: 'dev-store-001',
  name: 'NeXFlowX Tech Store',
  slug: 'nexflowx',
  logo_url: undefined,
  primary_color: '#00D4AA',
  require_document: true,
  require_phone: false,
  status: 'active',
  created_at: '2025-01-15T00:00:00Z',
};

const MOCK_LINKS: SmartPaymentLink[] = [
  {
    id: 'lnk_a1b2c3d4',
    title: 'Plano Premium Mensal',
    description: 'Acesso completo à plataforma',
    amount: 49.90,
    currency: 'EUR',
    sales_count: 127,
    status: 'active',
    is_single_use: false,
    shareable_url: 'https://pay.atlasglobal.digital/nexflowx/lnk_a1b2c3d4',
    created_at: '2025-06-01T10:30:00Z',
    expires_at: '2025-12-01T10:30:00Z',
  },
  {
    id: 'lnk_e5f6g7h8',
    title: 'Setup Consultoria UX',
    description: 'Sessão de 2h com designer sénior',
    amount: 350.00,
    currency: 'EUR',
    sales_count: 34,
    status: 'active',
    is_single_use: false,
    shareable_url: 'https://pay.atlasglobal.digital/nexflowx/lnk_e5f6g7h8',
    created_at: '2025-05-20T14:00:00Z',
    expires_at: '2025-11-20T14:00:00Z',
  },
  {
    id: 'lnk_i9j0k1l2',
    title: 'Licença Enterprise Anual',
    description: 'Licença para até 50 utilizadores',
    amount: 4999.00,
    currency: 'USD',
    sales_count: 8,
    status: 'active',
    is_single_use: true,
    shareable_url: 'https://pay.atlasglobal.digital/nexflowx/lnk_i9j0k1l2',
    created_at: '2025-06-10T09:00:00Z',
    expires_at: '2025-07-10T09:00:00Z',
  },
  {
    id: 'lnk_m3n4o5p6',
    title: 'Workshop Blockchain Introdutório',
    description: 'Workshop de 4h — conceitos e hands-on',
    amount: 189.90,
    currency: 'BRL',
    sales_count: 63,
    status: 'expired',
    is_single_use: false,
    shareable_url: 'https://pay.atlasglobal.digital/nexflowx/lnk_m3n4o5p6',
    created_at: '2025-03-01T08:00:00Z',
    expires_at: '2025-04-01T08:00:00Z',
  },
  {
    id: 'lnk_q7r8s9t0',
    title: 'Token USDT — Plano Starter',
    description: 'Pagamento inicial em USDT',
    amount: 99.00,
    currency: 'USDT',
    sales_count: 45,
    status: 'paid',
    is_single_use: false,
    shareable_url: 'https://pay.atlasglobal.digital/nexflowx/lnk_q7r8s9t0',
    created_at: '2025-04-15T12:00:00Z',
    expires_at: '2025-05-15T12:00:00Z',
  },
];

const MOCK_CUSTOMERS: CheckoutCustomer[] = [
  {
    id: 'cust_001',
    name: 'João Miguel Ferreira',
    email: 'joao.ferreira@protonmail.com',
    document: 'CPF: 123.456.789-00',
    total_spent: 1249.80,
    total_spent_currency: 'EUR',
    last_purchase_at: '2025-06-12T14:30:00Z',
    transactions_count: 5,
    created_at: '2025-03-15T10:00:00Z',
  },
  {
    id: 'cust_002',
    name: 'Ana Carolina Santos',
    email: 'ana.santos@outlook.com',
    document: 'CPF: 987.654.321-00',
    total_spent: 589.90,
    total_spent_currency: 'EUR',
    last_purchase_at: '2025-06-11T09:15:00Z',
    transactions_count: 3,
    created_at: '2025-04-20T10:00:00Z',
  },
  {
    id: 'cust_003',
    name: 'Pedro Rafael Oliveira',
    email: 'pedro.oliveira@gmail.com',
    document: 'NIF: 234567890',
    total_spent: 4999.00,
    total_spent_currency: 'USD',
    last_purchase_at: '2025-06-10T16:45:00Z',
    transactions_count: 1,
    created_at: '2025-05-01T10:00:00Z',
  },
  {
    id: 'cust_004',
    name: 'Mariana Isabel Costa',
    email: 'mariana.costa@icloud.com',
    document: 'CNPJ: 12.345.678/0001-90',
    total_spent: 3847.60,
    total_spent_currency: 'BRL',
    last_purchase_at: '2025-06-08T11:00:00Z',
    transactions_count: 8,
    created_at: '2025-02-10T10:00:00Z',
  },
  {
    id: 'cust_005',
    name: 'Luís André Martins',
    email: 'luis.martins@yahoo.com',
    document: 'CPF: 456.789.012-33',
    total_spent: 299.00,
    total_spent_currency: 'USDT',
    last_purchase_at: '2025-06-05T20:30:00Z',
    transactions_count: 2,
    created_at: '2025-06-01T10:00:00Z',
  },
  {
    id: 'cust_006',
    name: 'Sofia Beatriz Almeida',
    email: 'sofia.almeida@fastmail.com',
    document: 'NIF: 345678901',
    total_spent: 749.70,
    total_spent_currency: 'EUR',
    last_purchase_at: '2025-05-28T13:20:00Z',
    transactions_count: 4,
    created_at: '2025-01-20T10:00:00Z',
  },
];

/* ═══════════════════════════════════════════════════════════
   SHARED UI COMPONENTS
   ═══════════════════════════════════════════════════════════ */

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
      className="nex-mono text-[10px] px-2.5 py-1 rounded-md inline-flex items-center gap-1.5"
      style={{
        background: `${cfg.color}0D`,
        border: `1px solid ${cfg.color}25`,
        color: cfg.color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}60` }}
      />
      {cfg.label}
    </span>
  );
}

function InputField({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        className="nex-mono text-[10px] uppercase tracking-wider block"
        style={{ color: '#A0A0A0' }}
      >
        {label}
      </Label>
      {children}
      {hint && (
        <p className="nex-mono text-[9px]" style={{ color: '#444' }}>
          {hint}
        </p>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#FFFFFF',
};

const selectStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#FFFFFF',
  outline: 'none',
};

/* ═══════════════════════════════════════════════════════════
   TAB 1 — CONFIGURAÇÃO DA LOJA
   ═══════════════════════════════════════════════════════════ */

function StoreSettingsTab() {
  const { data: storeData, isLoading } = useCheckoutStore();
  const [isSaving, setIsSaving] = useState(false);

  const store = storeData || MOCK_STORE;

  const [name, setName] = useState(store.name);
  const [slug, setSlug] = useState(store.slug);
  const [primaryColor, setPrimaryColor] = useState(store.primary_color);
  const [requireDocument, setRequireDocument] = useState(store.require_document);
  const [requirePhone, setRequirePhone] = useState(store.require_phone);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const config: StoreCheckoutConfig = {
        name,
        slug,
        primary_color: primaryColor,
        require_document: requireDocument,
        require_phone: requirePhone,
      };
      await new Promise((r) => setTimeout(r, 800));
      toast.success('Configuração guardada com sucesso');
    } catch {
      toast.error('Erro ao guardar configuração');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Basic Info */}
      <div
        className="p-6 rounded-xl space-y-5"
        style={{
          background: 'rgba(14,17,23,0.85)',
          border: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Store className="w-4 h-4" style={{ color: '#00D4AA' }} />
          <span className="nex-mono text-[10px] uppercase tracking-widest" style={{ color: '#A0A0A0' }}>
            Informações da Loja
          </span>
        </div>

        <InputField label="Nome da Loja">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: NeXFlowX Tech Store"
            className="nex-mono text-sm"
            style={inputStyle}
          />
        </InputField>

        <InputField label="Slug (URL)" hint="Identificador único da sua loja no checkout">
          <div className="flex items-center gap-0 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <span
              className="nex-mono text-[10px] px-3 py-2.5 whitespace-nowrap flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#606060', borderRight: '1px solid rgba(255,255,255,0.06)' }}
            >
              pay.atlasglobal.digital/
            </span>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="minha-loja"
              className="nex-mono text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{ background: 'transparent', border: 'none', color: '#FFFFFF' }}
            />
          </div>
        </InputField>
      </div>

      {/* Branding */}
      <div
        className="p-6 rounded-xl space-y-5"
        style={{
          background: 'rgba(14,17,23,0.85)',
          border: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-4 h-4" style={{ color: '#00B4D8' }} />
          <span className="nex-mono text-[10px] uppercase tracking-widest" style={{ color: '#A0A0A0' }}>
            Branding
          </span>
        </div>

        {/* Logo URL */}
        <InputField label="URL do Logo" hint="Cole o link da imagem do logo da sua loja">
          <Input
            value={store.logo_url || ''}
            onChange={(e) => { /* logo URL stored locally for now */ }}
            placeholder="https://example.com/logo.png"
            className="nex-mono text-sm"
            style={inputStyle}
          />
        </InputField>

        {/* Primary Color */}
        <InputField label="Cor Principal">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex-shrink-0 transition-all"
              style={{
                background: primaryColor,
                border: '2px solid rgba(255,255,255,0.1)',
                boxShadow: `0 0 12px ${primaryColor}30`,
              }}
            />
            <Input
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#00D4AA"
              className="nex-mono text-sm font-mono flex-1"
              style={inputStyle}
              maxLength={7}
            />
            <div className="flex gap-1.5 flex-shrink-0">
              {['#00D4AA', '#00B4D8', '#FFB800', '#A855F7', '#EC4899', '#FFFFFF'].map((c) => (
                <button
                  key={c}
                  onClick={() => setPrimaryColor(c)}
                  className="w-6 h-6 rounded-md transition-all hover:scale-110"
                  style={{
                    background: c,
                    border: primaryColor === c ? '2px solid rgba(255,255,255,0.4)' : '2px solid rgba(255,255,255,0.06)',
                    boxShadow: primaryColor === c ? `0 0 8px ${c}40` : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        </InputField>
      </div>

      {/* Smart Checkout CRM */}
      <div
        className="p-6 rounded-xl space-y-5"
        style={{
          background: 'rgba(14,17,23,0.85)',
          border: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4" style={{ color: '#FFB800' }} />
          <span className="nex-mono text-[10px] uppercase tracking-widest" style={{ color: '#A0A0A0' }}>
            Smart Checkout CRM
          </span>
        </div>
        <p className="nex-mono text-[9px]" style={{ color: '#444' }}>
          Campos obrigatórios no checkout para recolha de dados do cliente
        </p>

        {/* Require Document */}
        <div
          className="flex items-center justify-between p-4 rounded-lg transition-all"
          style={{
            background: requireDocument ? 'rgba(0,212,170,0.04)' : 'rgba(255,255,255,0.015)',
            border: `1px solid ${requireDocument ? 'rgba(0,212,170,0.15)' : 'rgba(255,255,255,0.05)'}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{
                background: requireDocument ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.03)',
              }}
            >
              <FileText className="w-4 h-4" style={{ color: requireDocument ? '#00D4AA' : '#555' }} />
            </div>
            <div>
              <p className="nex-mono text-[11px] font-medium" style={{ color: '#E0E0E0' }}>
                Exigir Documento Fiscal (CPF/NIF/CNPJ)?
              </p>
              <p className="nex-mono text-[9px] mt-0.5" style={{ color: '#555' }}>
                Obriga o cliente a preencher documento no checkout
              </p>
            </div>
          </div>
          <Switch checked={requireDocument} onCheckedChange={setRequireDocument} />
        </div>

        {/* Require Phone */}
        <div
          className="flex items-center justify-between p-4 rounded-lg transition-all"
          style={{
            background: requirePhone ? 'rgba(0,180,216,0.04)' : 'rgba(255,255,255,0.015)',
            border: `1px solid ${requirePhone ? 'rgba(0,180,216,0.15)' : 'rgba(255,255,255,0.05)'}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{
                background: requirePhone ? 'rgba(0,180,216,0.1)' : 'rgba(255,255,255,0.03)',
              }}
            >
              <Phone className="w-4 h-4" style={{ color: requirePhone ? '#00B4D8' : '#555' }} />
            </div>
            <div>
              <p className="nex-mono text-[11px] font-medium" style={{ color: '#E0E0E0' }}>
                Exigir Número de Telefone?
              </p>
              <p className="nex-mono text-[9px] mt-0.5" style={{ color: '#555' }}>
                Obriga o cliente a fornecer contacto telefónico
              </p>
            </div>
          </div>
          <Switch checked={requirePhone} onCheckedChange={setRequirePhone} />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={isSaving || !name.trim() || !slug.trim()}
          className="nex-mono text-[11px] uppercase tracking-wider font-semibold px-6 py-2.5 rounded-lg transition-all hover-lift"
          style={{
            background: isSaving ? 'rgba(0,212,170,0.15)' : '#00D4AA',
            color: '#0F1117',
            border: 'none',
          }}
        >
          {isSaving ? 'A guardar...' : 'Guardar Configuração'}
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 2 — LINKS DE PAGAMENTO
   ═══════════════════════════════════════════════════════════ */

function PaymentLinksTab() {
  const { data: linksData, isLoading } = useSmartPaymentLinks();
  const createLink = useCreatePaymentLink();
  const links: SmartPaymentLink[] = (linksData as SmartPaymentLink[] | undefined) ?? MOCK_LINKS;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCurrency, setNewCurrency] = useState('EUR');
  const [singleUse, setSingleUse] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const activeLinks = useMemo(() => links.filter((l) => l.status === 'active'), [links]);
  const otherLinks = useMemo(() => links.filter((l) => l.status !== 'active'), [links]);
  const totalSales = useMemo(() => links.reduce((acc, l) => acc + (l.sales_count || 0), 0), [links]);
  const totalRevenue = useMemo(
    () =>
      links.reduce((acc, l) => {
        if (l.status === 'paid') return acc + l.amount * (l.sales_count || 0);
        return acc;
      }, 0),
    [links],
  );

  const handleCreate = async () => {
    if (!newTitle.trim() || !newAmount) return;
    setIsCreating(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const linkId = `lnk_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const url = `https://pay.atlasglobal.digital/nexflowx/${linkId}`;
      setGeneratedLink(url);
      toast.success('Link de pagamento criado com sucesso');
    } catch {
      toast.error('Erro ao criar link de pagamento');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewAmount('');
    setNewCurrency('EUR');
    setSingleUse(false);
    setGeneratedLink('');
  };

  const closeDialog = () => { resetForm(); setDialogOpen(false); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
              Links de Pagamento
            </h3>
            <p className="nex-mono text-[9px] mt-0.5" style={{ color: '#606060' }}>
              {links.length} link{links.length !== 1 ? 's' : ''} · {totalSales} vendas · {fmt(totalRevenue, 'EUR')} volume
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className="nex-mono text-[10px] px-2.5 py-0.5"
              style={{
                background: 'rgba(0,212,170,0.08)',
                border: '1px solid rgba(0,212,170,0.2)',
                color: '#00D4AA',
              }}
            >
              {activeLinks.length} ativo{activeLinks.length !== 1 ? 's' : ''}
            </Badge>
            {otherLinks.length > 0 && (
              <Badge
                className="nex-mono text-[10px] px-2.5 py-0.5"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#606060',
                }}
              >
                {otherLinks.length} históric{otherLinks.length !== 1 ? 'os' : 'o'}
              </Badge>
            )}
          </div>
        </div>
        <Button
          onClick={() => { resetForm(); setDialogOpen(true); }}
          className="flex items-center gap-2 nex-mono text-[11px] uppercase tracking-wider font-semibold px-4 py-2.5 rounded-lg transition-all hover-lift"
          style={{
            background: 'rgba(0,180,216,0.08)',
            border: '1px solid rgba(0,180,216,0.2)',
            color: '#00B4D8',
          }}
        >
          <Plus className="w-4 h-4" />
          Novo Link
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && links.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl"
          style={{ background: 'rgba(14,17,23,0.4)', border: '1px solid rgba(255,255,255,0.04)' }}
        >
          <Link2 className="w-10 h-10 mb-3" style={{ color: '#333' }} />
          <p className="nex-mono text-sm" style={{ color: '#606060' }}>Nenhum link de pagamento</p>
          <p className="nex-mono text-[10px] mt-1" style={{ color: '#444' }}>
            Crie o seu primeiro checkout link para começar a vender
          </p>
        </div>
      )}

      {/* Active Links Table */}
      {!isLoading && activeLinks.length > 0 && (
        <div>
          <p className="nex-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: '#606060' }}>
            <TrendingUp className="w-3 h-3 inline mr-1.5" />
            Links Ativos ({activeLinks.length})
          </p>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'rgba(14,17,23,0.85)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <Table>
              <TableHeader>
                <TableRow style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <TableHead className="nex-mono text-[9px] uppercase tracking-widest" style={{ color: '#606060' }}>
                    Produto
                  </TableHead>
                  <TableHead className="nex-mono text-[9px] uppercase tracking-widest text-right" style={{ color: '#606060' }}>
                    Valor
                  </TableHead>
                  <TableHead className="nex-mono text-[9px] uppercase tracking-widest text-center" style={{ color: '#606060' }}>
                    Moeda
                  </TableHead>
                  <TableHead className="nex-mono text-[9px] uppercase tracking-widest text-center" style={{ color: '#606060' }}>
                    Vendas
                  </TableHead>
                  <TableHead className="nex-mono text-[9px] uppercase tracking-widest text-center" style={{ color: '#606060' }}>
                    Estado
                  </TableHead>
                  <TableHead className="nex-mono text-[9px] uppercase tracking-widest text-right" style={{ color: '#606060' }}>
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeLinks.map((link) => (
                  <TableRow
                    key={link.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  >
                    <TableCell>
                      <div>
                        <p className="nex-mono text-[11px] font-medium truncate max-w-[200px]" style={{ color: '#E0E0E0' }}>
                          {link.title}
                        </p>
                        {link.is_single_use && (
                          <span className="nex-mono text-[9px] px-1.5 py-0.5 rounded mt-0.5 inline-block" style={{ background: 'rgba(255,184,0,0.08)', color: '#FFB800' }}>
                            ÚNICO
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right nex-mono text-[11px] font-semibold" style={{ color: '#FFFFFF' }}>
                      {fmt(link.amount, link.currency)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className="nex-mono text-[10px] px-2 py-0.5 rounded-md"
                        style={{ background: 'rgba(255,255,255,0.04)', color: '#A0A0A0' }}
                      >
                        {link.currency}
                      </span>
                    </TableCell>
                    <TableCell className="text-center nex-mono text-[11px]" style={{ color: '#A0A0A0' }}>
                      {link.sales_count}
                    </TableCell>
                    <TableCell className="text-center">
                      <LinkStatusBadge status={link.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {link.shareable_url && <CopyButton text={link.shareable_url} label="URL" />}
                        {link.shareable_url && (
                          <a
                            href={link.shareable_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="nex-mono text-[10px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              color: '#606060',
                            }}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Abrir
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Other Links Table */}
      {!isLoading && otherLinks.length > 0 && (
        <div>
          <p className="nex-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: '#606060' }}>
            <Clock className="w-3 h-3 inline mr-1.5" />
            Histórico ({otherLinks.length})
          </p>
          <div
            className="rounded-xl overflow-hidden max-h-72 overflow-y-auto cyber-scrollbar"
            style={{
              background: 'rgba(14,17,23,0.6)',
              border: '1px solid rgba(255,255,255,0.03)',
            }}
          >
            <Table>
              <TableHeader>
                <TableRow style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <TableHead className="nex-mono text-[9px] uppercase tracking-widest" style={{ color: '#555' }}>
                    Produto
                  </TableHead>
                  <TableHead className="nex-mono text-[9px] uppercase tracking-widest text-right" style={{ color: '#555' }}>
                    Valor
                  </TableHead>
                  <TableHead className="nex-mono text-[9px] uppercase tracking-widest text-center" style={{ color: '#555' }}>
                    Moeda
                  </TableHead>
                  <TableHead className="nex-mono text-[9px] uppercase tracking-widest text-center" style={{ color: '#555' }}>
                    Vendas
                  </TableHead>
                  <TableHead className="nex-mono text-[9px] uppercase tracking-widest text-center" style={{ color: '#555' }}>
                    Estado
                  </TableHead>
                  <TableHead className="nex-mono text-[9px] uppercase tracking-widest text-right" style={{ color: '#555' }}>
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherLinks.map((link) => (
                  <TableRow
                    key={link.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}
                  >
                    <TableCell>
                      <p className="nex-mono text-[11px] truncate max-w-[200px]" style={{ color: '#888' }}>
                        {link.title}
                      </p>
                    </TableCell>
                    <TableCell className="text-right nex-mono text-[11px]" style={{ color: '#888' }}>
                      {fmt(link.amount, link.currency)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="nex-mono text-[10px]" style={{ color: '#666' }}>
                        {link.currency}
                      </span>
                    </TableCell>
                    <TableCell className="text-center nex-mono text-[11px]" style={{ color: '#666' }}>
                      {link.sales_count}
                    </TableCell>
                    <TableCell className="text-center">
                      <LinkStatusBadge status={link.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {link.shareable_url && <CopyButton text={link.shareable_url} label="URL" />}
                        {link.shareable_url && (
                          <a
                            href={link.shareable_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="nex-mono text-[10px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                            style={{
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.04)',
                              color: '#555',
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Create Link Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-md p-0 overflow-hidden"
          style={{ background: '#0E1117', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <DialogHeader className="p-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <DialogTitle className="text-base font-semibold flex items-center gap-2" style={{ color: '#FFFFFF' }}>
              <Plus className="w-5 h-5" style={{ color: '#00B4D8' }} />
              Novo Link de Pagamento
            </DialogTitle>
            <DialogDescription className="nex-mono text-[10px]" style={{ color: '#606060' }}>
              Crie um checkout link para cobrar clientes
            </DialogDescription>
          </DialogHeader>

          {!generatedLink ? (
            <div className="p-6 space-y-5">
              <InputField label="Título do Produto/Serviço">
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Plano Premium Mensal"
                  className="nex-mono text-sm"
                  style={inputStyle}
                />
              </InputField>

              <div className="grid grid-cols-2 gap-3">
                <InputField label="Valor">
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="0.00"
                    className="nex-mono text-sm"
                    style={inputStyle}
                  />
                </InputField>
                <InputField label="Moeda">
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value)}
                    className="mt-1.5 w-full nex-mono text-sm rounded-lg px-3 py-2"
                    style={selectStyle}
                  >
                    <option value="EUR">EUR €</option>
                    <option value="BRL">BRL R$</option>
                    <option value="USD">USD $</option>
                    <option value="USDT">USDT ₮</option>
                  </select>
                </InputField>
              </div>

              {/* Single Use Toggle */}
              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{
                  background: singleUse ? 'rgba(255,184,0,0.04)' : 'rgba(255,255,255,0.015)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div>
                  <p className="nex-mono text-[11px] font-medium" style={{ color: '#E0E0E0' }}>
                    {singleUse ? 'Link de Uso Único' : 'Link Reutilizável'}
                  </p>
                  <p className="nex-mono text-[9px] mt-0.5" style={{ color: '#555' }}>
                    {singleUse
                      ? 'O link expira após 1 pagamento'
                      : 'Múltiplos clientes podem usar este link'}
                  </p>
                </div>
                <Switch checked={singleUse} onCheckedChange={setSingleUse} />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  onClick={handleCreate}
                  disabled={isCreating || !newTitle.trim() || !newAmount}
                  className="flex-1 nex-mono text-[11px] uppercase tracking-wider font-semibold py-3 rounded-lg transition-all"
                  style={{
                    background: isCreating ? 'rgba(0,180,216,0.15)' : '#00B4D8',
                    color: '#0F1117',
                    border: 'none',
                  }}
                >
                  {isCreating ? 'A gerar link...' : 'Gerar Link'}
                </Button>
                <Button
                  onClick={closeDialog}
                  className="nex-mono text-[11px] uppercase tracking-wider font-semibold px-4 py-3 rounded-lg transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#A0A0A0',
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            /* Generated Link Display */
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)' }}
                >
                  <Check className="w-4 h-4" style={{ color: '#00D4AA' }} />
                </div>
                <div>
                  <p className="nex-mono text-[11px] font-medium" style={{ color: '#00D4AA' }}>
                    Link Gerado com Sucesso
                  </p>
                  <p className="nex-mono text-[9px]" style={{ color: '#555' }}>
                    Partilhe com o seu cliente
                  </p>
                </div>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{
                  background: 'rgba(0,212,170,0.04)',
                  border: '1px solid rgba(0,212,170,0.15)',
                }}
              >
                <p className="nex-mono text-[9px] uppercase tracking-widest mb-2" style={{ color: '#606060' }}>
                  Link de Pagamento
                </p>
                <p
                  className="nex-mono text-[11px] break-all leading-relaxed"
                  style={{ color: '#00D4AA' }}
                >
                  {generatedLink}
                </p>
              </div>

              <div className="flex gap-2">
                <CopyButton text={generatedLink} label="Copiar Link" />
                <a
                  href={generatedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nex-mono text-[10px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#606060',
                  }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Testar Link
                </a>
              </div>

              <Button
                onClick={closeDialog}
                className="w-full nex-mono text-[11px] uppercase tracking-wider font-semibold py-3 rounded-lg mt-2 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#A0A0A0',
                }}
              >
                Concluir
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 3 — CLIENTES (MINI-CRM)
   ═══════════════════════════════════════════════════════════ */

function CustomersTab() {
  const { data: customersData, isLoading } = useCustomers();
  const customers: CheckoutCustomer[] = (customersData as CheckoutCustomer[] | undefined) ?? MOCK_CUSTOMERS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
            Clientes
          </h3>
          <p className="nex-mono text-[9px] mt-0.5" style={{ color: '#606060' }}>
            Mini-CRM · {customers.length} cliente{customers.length !== 1 ? 's' : ''} registado{customers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Badge
          className="nex-mono text-[10px] px-2.5 py-0.5"
          style={{
            background: 'rgba(0,212,170,0.08)',
            border: '1px solid rgba(0,212,170,0.2)',
            color: '#00D4AA',
          }}
        >
          <Users className="w-3 h-3 mr-1" />
          {customers.length} total
        </Badge>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && customers.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl"
          style={{ background: 'rgba(14,17,23,0.4)', border: '1px solid rgba(255,255,255,0.04)' }}
        >
          <Users className="w-10 h-10 mb-3" style={{ color: '#333' }} />
          <p className="nex-mono text-sm" style={{ color: '#606060' }}>Nenhum cliente registado</p>
          <p className="nex-mono text-[10px] mt-1" style={{ color: '#444' }}>
            Os clientes aparecerão aqui após o primeiro checkout
          </p>
        </div>
      )}

      {/* Customers Table */}
      {!isLoading && customers.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'rgba(14,17,23,0.85)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <Table>
            <TableHeader>
              <TableRow style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <TableHead className="nex-mono text-[9px] uppercase tracking-widest" style={{ color: '#606060' }}>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3 h-3" />
                    Nome
                  </span>
                </TableHead>
                <TableHead className="nex-mono text-[9px] uppercase tracking-widest" style={{ color: '#606060' }}>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3" />
                    Email
                  </span>
                </TableHead>
                <TableHead className="nex-mono text-[9px] uppercase tracking-widest hidden md:table-cell" style={{ color: '#606060' }}>
                  <span className="flex items-center gap-1.5">
                    <Hash className="w-3 h-3" />
                    Documento
                  </span>
                </TableHead>
                <TableHead className="nex-mono text-[9px] uppercase tracking-widest text-right" style={{ color: '#606060' }}>
                  <span className="flex items-center justify-end gap-1.5">
                    <TrendingUp className="w-3 h-3" />
                    Total Gasto
                  </span>
                </TableHead>
                <TableHead className="nex-mono text-[9px] uppercase tracking-widest text-right hidden lg:table-cell" style={{ color: '#606060' }}>
                  <span className="flex items-center justify-end gap-1.5">
                    <Clock className="w-3 h-3" />
                    Última Compra
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="transition-all group"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-105"
                        style={{
                          background: 'rgba(0,212,170,0.06)',
                          border: '1px solid rgba(0,212,170,0.1)',
                        }}
                      >
                        <span
                          className="nex-mono text-[10px] font-bold"
                          style={{ color: '#00D4AA' }}
                        >
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="nex-mono text-[11px] font-medium truncate max-w-[160px]" style={{ color: '#E0E0E0' }}>
                          {customer.name}
                        </p>
                        <p className="nex-mono text-[9px] md:hidden" style={{ color: '#555' }}>
                          {customer.document}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="nex-mono text-[10px] truncate block max-w-[180px]" style={{ color: '#A0A0A0' }}>
                      {customer.email}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span
                      className="nex-mono text-[10px] px-2 py-0.5 rounded-md"
                      style={{ background: 'rgba(255,255,255,0.03)', color: '#888' }}
                    >
                      {customer.document}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <p className="nex-mono text-[11px] font-semibold" style={{ color: '#FFFFFF' }}>
                        {fmt(customer.total_spent, customer.total_spent_currency)}
                      </p>
                      <p className="nex-mono text-[9px]" style={{ color: '#555' }}>
                        {customer.transactions_count} compra{customer.transactions_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right hidden lg:table-cell">
                    <span className="nex-mono text-[10px]" style={{ color: '#666' }}>
                      {new Date(customer.last_purchase_at).toLocaleDateString('pt-PT', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Footer Summary */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}
          >
            <span className="nex-mono text-[9px]" style={{ color: '#555' }}>
              {customers.length} cliente{customers.length !== 1 ? 's' : ''}
            </span>
            <span className="nex-mono text-[9px]" style={{ color: '#555' }}>
              Volume total:{' '}
              <span style={{ color: '#00D4AA' }}>
                {fmt(
                  customers.reduce((acc, c) => acc + c.total_spent, 0),
                  'EUR',
                )}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function CheckoutPanel() {
  const [activeTab, setActiveTab] = useState('store');

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Module Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'rgba(0,212,170,0.08)',
            border: '1px solid rgba(0,212,170,0.15)',
          }}
        >
          <ShoppingCart className="w-5 h-5" style={{ color: '#00D4AA' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
            Checkout & Lojas
          </h2>
          <p className="nex-mono text-[10px] mt-0.5" style={{ color: '#606060' }}>
            Smart checkout · Links de pagamento · Mini-CRM
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList
          className="w-full flex rounded-xl p-1 gap-1"
          style={{
            background: 'rgba(14,17,23,0.85)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <TabsTrigger
            value="store"
            className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 transition-all data-[state=active]"
            style={{
              color: activeTab === 'store' ? '#00D4AA' : '#606060',
              background: activeTab === 'store' ? 'rgba(0,212,170,0.08)' : 'transparent',
              border: activeTab === 'store' ? '1px solid rgba(0,212,170,0.2)' : '1px solid transparent',
              borderBottom: activeTab === 'store' ? '2px solid #00D4AA' : '2px solid transparent',
              borderRadius: '8px',
            }}
          >
            <Store className="w-4 h-4" />
            <span className="nex-mono text-[10px] uppercase tracking-wider">Configuração</span>
          </TabsTrigger>
          <TabsTrigger
            value="links"
            className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 transition-all data-[state=active]"
            style={{
              color: activeTab === 'links' ? '#00B4D8' : '#606060',
              background: activeTab === 'links' ? 'rgba(0,180,216,0.08)' : 'transparent',
              border: activeTab === 'links' ? '1px solid rgba(0,180,216,0.2)' : '1px solid transparent',
              borderBottom: activeTab === 'links' ? '2px solid #00B4D8' : '2px solid transparent',
              borderRadius: '8px',
            }}
          >
            <Link2 className="w-4 h-4" />
            <span className="nex-mono text-[10px] uppercase tracking-wider">Links</span>
          </TabsTrigger>
          <TabsTrigger
            value="customers"
            className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 transition-all data-[state=active]"
            style={{
              color: activeTab === 'customers' ? '#FFB800' : '#606060',
              background: activeTab === 'customers' ? 'rgba(255,184,0,0.08)' : 'transparent',
              border: activeTab === 'customers' ? '1px solid rgba(255,184,0,0.2)' : '1px solid transparent',
              borderBottom: activeTab === 'customers' ? '2px solid #FFB800' : '2px solid transparent',
              borderRadius: '8px',
            }}
          >
            <Users className="w-4 h-4" />
            <span className="nex-mono text-[10px] uppercase tracking-wider">Clientes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="mt-6">
          <StoreSettingsTab />
        </TabsContent>

        <TabsContent value="links" className="mt-6">
          <PaymentLinksTab />
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <CustomersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
