'use client';

import { useState } from 'react';
import { useWallets, useDeposit } from '@/hooks/use-wallets';
import { Download, Loader2, CheckCircle, Copy, ExternalLink } from 'lucide-react';
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
import type { Wallet, DepositResponse } from '@/lib/api/contracts';

/* ─── Base Currencies for Reference ─── */
const BASE_CURRENCIES = ['EUR', 'USDT', 'USD', 'BRL'] as const;

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

export default function DepositWidget() {
  const { data: wallets } = useWallets();
  const depositMut = useDeposit();
  const allWallets: Wallet[] = wallets ?? [];

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Get available currencies from wallets, prioritizing base currencies
  const availableCurrencies = (() => {
    const walletCurrencies = new Set(allWallets.map((w) => w.currency_code));
    const base = BASE_CURRENCIES.filter(c => walletCurrencies.has(c));
    const others = [...walletCurrencies].filter(c => !BASE_CURRENCIES.includes(c as typeof BASE_CURRENCIES[number]));
    return [...base, ...others];
  })();

  const selectedWallet = allWallets.find((w) => w.currency_code === currency);
  const parsedAmount = parseFloat(amount) || 0;
  const canGenerate = parsedAmount > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    try {
      const res: DepositResponse = await depositMut.mutateAsync({
        amount: parsedAmount,
        currency,
      });
      if (res?.shareable_url) {
        setPaymentLink(res.shareable_url);
      }
      setAmount('');
    } catch {
      // handled by mutation
    }
  };

  const handleCopy = async () => {
    if (!paymentLink) return;
    try {
      await navigator.clipboard.writeText(paymentLink);
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
          <Select value={currency} onValueChange={setCurrency}>
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
              Saldo atual: <span style={{ color: '#00D4AA' }}>{fmt(selectedWallet.balance_available, currency)}</span>
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
      <Dialog open={!!paymentLink} onOpenChange={(open) => { if (!open) setPaymentLink(null); }}>
        <DialogContent 
          className="p-6"
          style={{ 
            background: 'rgba(14, 19, 27, 0.98)', 
            border: '1px solid rgba(0, 212, 170, 0.2)',
            maxWidth: '440px',
            zIndex: 9999,
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base" style={{ color: '#00D4AA' }}>
              <CheckCircle className="w-5 h-5" />
              Link Gerado com Sucesso
            </DialogTitle>
            <DialogDescription className="text-xs" style={{ color: '#A0A0A0' }}>
              Partilhe este link com o pagador para completar o depósito.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <div
              className="p-3 rounded-lg text-xs break-all"
              style={{
                background: 'rgba(0, 212, 170, 0.04)',
                border: '1px solid rgba(0, 212, 170, 0.12)',
                color: '#00B4D8',
                wordBreak: 'break-all',
              }}
            >
              {paymentLink}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-all"
              style={{
                background: 'linear-gradient(135deg, #00D4AA, #00B4D8)',
                color: '#0F1117',
              }}
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copiado!' : 'Copiar Link'}
            </button>
            {paymentLink && (
              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-all"
                style={{
                  background: 'rgba(0, 180, 216, 0.08)',
                  border: '1px solid rgba(0, 180, 216, 0.25)',
                  color: '#00B4D8',
                }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
