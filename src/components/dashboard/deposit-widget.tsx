'use client';

import { useState } from 'react';
import { useWallets, useDeposit } from '@/hooks/use-wallets';
import { depositApi } from '@/lib/api/atlas-client';
import type {
  DepositRequest,
  DepositResponse,
  DepositRoute,
  Currency,
} from '@/types/atlas';
import {
  Download,
  Loader2,
  CheckCircle,
  Copy,
  ExternalLink,
  Building2,
  CreditCard,
  QrCode,
  Landmark,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Wallet } from '@/types/atlas';

/* ─── Base Currencies for Reference ─── */
const BASE_CURRENCIES: Currency[] = ['EUR', 'USDT', 'USD', 'BRL'];

function fmt(n: number, code: string) {
  try {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: code, minimumFractionDigits: 2 }).format(n);
  } catch {
    return `${code} ${n.toFixed(2)}`;
  }
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
      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
      style={{
        background: colors[currency] || '#333',
        color: '#fff',
      }}
    >
      {symbols[currency] || currency.slice(0, 1)}
    </div>
  );
}

/* ─── Route Method Icons ─── */
function RouteMethodIcon({ method }: { method: string }) {
  switch (method) {
    case 'PIX':
      return <QrCode className="w-4 h-4" style={{ color: '#00D4AA' }} />;
    case 'CARD':
      return <CreditCard className="w-4 h-4" style={{ color: '#00D4AA' }} />;
    case 'BANK_TRANSFER':
      return <Landmark className="w-4 h-4" style={{ color: '#00D4AA' }} />;
    default:
      return <Building2 className="w-4 h-4" style={{ color: '#00D4AA' }} />;
  }
}

/* ─── Deposit Route Card ─── */
function DepositRouteCard({ route }: { route: DepositRoute }) {
  const [copied, setCopied] = useState(false);
  const { payload } = route;

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
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: 'rgba(0, 212, 170, 0.04)',
        border: '1px solid rgba(0, 212, 170, 0.12)',
      }}
    >
      {/* Route header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RouteMethodIcon method={route.method} />
          <span className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
            {route.providerName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {route.estimatedFee > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#A0A0A0' }}>
              Taxa: {route.estimatedFee}%
            </span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(0, 212, 170, 0.1)', color: '#00D4AA' }}>
            {route.estimatedArrival}
          </span>
        </div>
      </div>

      {/* PIX Code */}
      {payload.pixCode && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: '#A0A0A0' }}>
            Código PIX
          </p>
          <div className="flex items-center gap-2">
            <div
              className="flex-1 p-2.5 rounded-lg text-xs break-all font-mono"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                color: '#00B4D8',
                wordBreak: 'break-all',
                maxHeight: '80px',
                overflowY: 'auto',
              }}
            >
              {payload.pixCode}
            </div>
            <button
              onClick={() => handleCopy(payload.pixCode!)}
              className="shrink-0 p-2.5 rounded-lg transition-all"
              style={{
                background: 'rgba(0, 212, 170, 0.08)',
                border: '1px solid rgba(0, 212, 170, 0.2)',
              }}
              title="Copiar PIX"
            >
              <Copy className="w-3.5 h-3.5" style={{ color: copied ? '#00D4AA' : '#A0A0A0' }} />
            </button>
          </div>
        </div>
      )}

      {/* PIX Image (QR Code) */}
      {payload.pixImageBase64 && (
        <div className="flex justify-center">
          <img
            src={`data:image/png;base64,${payload.pixImageBase64}`}
            alt="QR Code PIX"
            className="w-40 h-40 rounded-lg"
            style={{ border: '1px solid rgba(255, 255, 255, 0.06)' }}
          />
        </div>
      )}

      {/* Stripe Client Secret */}
      {payload.stripeClientSecret && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(99, 91, 255, 0.06)', border: '1px solid rgba(99, 91, 255, 0.15)' }}>
          <CreditCard className="w-4 h-4" style={{ color: '#635BFF' }} />
          <span className="text-xs" style={{ color: '#A0A0A0' }}>
            Pagamento por cartão disponível via Stripe
          </span>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(99, 91, 255, 0.15)', color: '#635BFF' }}>
            Pronto
          </span>
        </div>
      )}

      {/* Redirect URL */}
      {payload.redirectUrl && (
        <a
          href={payload.redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: 'rgba(0, 180, 216, 0.08)',
            border: '1px solid rgba(0, 180, 216, 0.25)',
            color: '#00B4D8',
          }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Concluir Pagamento
        </a>
      )}

      {/* Bank Details */}
      {payload.bankDetails && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: '#A0A0A0' }}>
            Dados Bancários
          </p>
          <div className="rounded-lg p-3 space-y-1.5" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <BankDetailRow label="IBAN" value={payload.bankDetails.iban} />
            <BankDetailRow label="BIC / SWIFT" value={payload.bankDetails.bic} />
            <BankDetailRow label="Beneficiário" value={payload.bankDetails.beneficiary} />
            <BankDetailRow label="Referência" value={payload.bankDetails.reference} />
          </div>
          <button
            onClick={() => handleCopy(`IBAN: ${payload.bankDetails!.iban}\nBIC: ${payload.bankDetails!.bic}\nBeneficiário: ${payload.bankDetails!.beneficiary}\nReferência: ${payload.bankDetails!.reference}`)}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-[11px] font-medium transition-all"
            style={{
              background: 'rgba(0, 212, 170, 0.08)',
              border: '1px solid rgba(0, 212, 170, 0.2)',
              color: '#00D4AA',
            }}
          >
            <Copy className="w-3 h-3" />
            {copied ? 'Copiado!' : 'Copiar Dados'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Bank Detail Row ─── */
function BankDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] shrink-0" style={{ color: '#606060' }}>{label}</span>
      <span className="text-xs font-mono text-right break-all" style={{ color: '#FFFFFF' }}>{value}</span>
    </div>
  );
}

export default function DepositWidget() {
  const { data: wallets } = useWallets();
  const depositMut = useDeposit();
  const allWallets: Wallet[] = wallets ?? [];

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [depositResult, setDepositResult] = useState<DepositResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Get available currencies from wallets, prioritizing base currencies
  const availableCurrencies: Currency[] = (() => {
    const walletCurrencies = new Set(allWallets.map((w) => w.currency));
    const base = BASE_CURRENCIES.filter(c => walletCurrencies.has(c));
    const others = [...walletCurrencies].filter(c => !BASE_CURRENCIES.includes(c as Currency)) as Currency[];
    return [...base, ...others];
  })();

  const selectedWallet = allWallets.find((w) => w.currency === currency);
  const parsedAmount = parseFloat(amount) || 0;
  const canGenerate = parsedAmount > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    try {
      const data: DepositRequest = {
        amount: parsedAmount,
        currency,
      };
      const res: DepositResponse = await depositApi.initiate(data);
      setDepositResult(res);
      setAmount('');
    } catch {
      // handled by mutation
    }
  };

  const handleCopyRef = async () => {
    if (!depositResult) return;
    try {
      await navigator.clipboard.writeText(depositResult.transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-up">
      <div className="glass-panel p-6" style={{ background: 'rgba(10, 13, 20, 0.9)' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D4AA20, #00B4D820)', border: '1px solid rgba(0, 212, 170, 0.2)' }}>
            <Download className="w-5 h-5" style={{ color: '#00D4AA' }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>Depositar Fundos</h3>
            <p className="text-xs" style={{ color: '#606060' }}>Gerar link de pagamento</p>
          </div>
        </div>

        <div
          className="p-4 rounded-xl mb-6"
          style={{ background: 'rgba(0, 212, 170, 0.03)', border: '1px solid rgba(0, 212, 170, 0.08)' }}
        >
          <p className="text-xs mb-2" style={{ color: '#A0A0A0' }}>
            Gere um link de pagamento seguro para depositar fundos na sua conta.
          </p>
          <div className="flex items-center gap-2">
            <span className="status-dot active" />
            <span className="text-[10px]" style={{ color: '#00D4AA' }}>
              Pagamentos processados em tempo real
            </span>
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
            Montante do Depósito
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl px-4 py-4 text-lg font-bold nex-mono"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: '#FFFFFF',
            }}
            placeholder="0.00"
            min="0"
          />
        </div>

        {/* Currency Select - Using shadcn Select */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
            Moeda
          </label>
          <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
            <SelectTrigger
              className="w-full rounded-xl px-4 py-6 text-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                color: '#FFFFFF',
              }}
            >
              <SelectValue>
                <div className="flex items-center gap-2">
                  <CurrencyIcon currency={currency} />
                  <span className="font-semibold">{currency}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              style={{
                background: '#14171E',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                zIndex: 9999,
              }}
            >
              {availableCurrencies.map((c) => (
                <SelectItem
                  key={c}
                  value={c}
                  style={{
                    background: 'transparent',
                    color: '#FFFFFF',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <CurrencyIcon currency={c} />
                    <span className="font-medium">{c}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedWallet && (
            <p className="text-xs" style={{ color: '#606060' }}>
              Saldo atual: <span style={{ color: '#00D4AA' }}>{fmt(selectedWallet.balanceAvailable, currency)}</span>
            </p>
          )}
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || depositMut.isPending}
          className="w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: canGenerate
              ? 'linear-gradient(135deg, #00D4AA, #00B4D8)'
              : 'rgba(255, 255, 255, 0.05)',
            color: canGenerate ? '#0F1117' : '#606060',
            border: canGenerate ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {depositMut.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              A gerar link de pagamento...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Gerar Link de Pagamento
            </>
          )}
        </button>

        {depositMut.isError && (
          <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(255, 59, 92, 0.05)', border: '1px solid rgba(255, 59, 92, 0.2)', color: '#FF5252' }}>
            Erro ao gerar link de pagamento. Tente novamente.
          </div>
        )}
      </div>

      {/* Success dialog */}
      <Dialog open={!!depositResult} onOpenChange={(open) => { if (!open) setDepositResult(null); }}>
        <DialogContent
          className="p-6"
          style={{
            background: 'rgba(14, 19, 27, 0.98)',
            border: '1px solid rgba(0, 212, 170, 0.2)',
            maxWidth: '520px',
            zIndex: 9999,
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base" style={{ color: '#00D4AA' }}>
              <CheckCircle className="w-5 h-5" />
              Depósito Iniciado com Sucesso
            </DialogTitle>
            <DialogDescription className="text-xs" style={{ color: '#A0A0A0' }}>
              Escolha um método de pagamento abaixo para completar o depósito.
            </DialogDescription>
          </DialogHeader>

          {/* Transaction reference */}
          {depositResult && (
            <div className="my-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: '#606060' }}>
                  Referência da Transação
                </p>
                <p className="text-xs font-mono" style={{ color: '#00B4D8' }}>
                  {depositResult.transactionId}
                </p>
              </div>
              <button
                onClick={handleCopyRef}
                className="shrink-0 p-2 rounded-lg transition-all"
                style={{
                  background: 'rgba(0, 212, 170, 0.08)',
                  border: '1px solid rgba(0, 212, 170, 0.2)',
                }}
                title="Copiar referência"
              >
                <Copy className="w-3.5 h-3.5" style={{ color: copied ? '#00D4AA' : '#A0A0A0' }} />
              </button>
            </div>
          )}

          {/* Deposit routes */}
          <div className="my-3 space-y-3 max-h-[400px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            {depositResult?.routes.map((route, idx) => (
              <DepositRouteCard key={`${route.provider}-${idx}`} route={route} />
            ))}
          </div>

          {depositResult?.routes.length === 0 && (
            <div className="my-3 p-3 rounded-lg text-center text-xs" style={{ background: 'rgba(255, 255, 255, 0.03)', color: '#A0A0A0' }}>
              Nenhuma rota de depósito disponível para esta moeda.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
