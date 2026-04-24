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
import type { Wallet, DepositResponse } from '@/lib/api/contracts';

function fmt(n: number, code: string) {
  try {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: code, minimumFractionDigits: 2 }).format(n);
  } catch {
    return `${code} ${n.toFixed(2)}`;
  }
}

export default function DepositWidget() {
  const { data: wallets } = useWallets();
  const depositMut = useDeposit();
  const allWallets: Wallet[] = wallets ?? [];

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedWallet = allWallets.find((w) => w.currency_code === currency);
  const parsedAmount = parseFloat(amount) || 0;
  const canGenerate = parsedAmount > 0;

  const availableCurrencies = [...new Set(allWallets.map((w) => w.currency_code))];

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
      <div className="glass-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <Download className="w-5 h-5" style={{ color: '#00D4AA' }} />
          <h3 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>Depositar Fundos</h3>
        </div>

        <div
          className="p-4 rounded-lg mb-6"
          style={{ background: 'rgba(0,212,170,0.03)', border: '1px solid rgba(0,212,170,0.08)' }}
        >
          <p className="text-xs mb-2" style={{ color: '#A0A0A0' }}>
            Gere um link de pagamento seguro para depositar fundos na sua conta NeXFlowX.
          </p>
          <div className="flex items-center gap-2">
            <span className="status-dot active" />
            <span className="nex-mono text-[10px]" style={{ color: '#00D4AA' }}>
              Pagamentos processados em tempo real
            </span>
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-2 mb-4">
          <label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
            Montante do Depósito
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="neon-input w-full rounded-lg px-4 py-3 text-sm nex-mono"
            placeholder="0.00"
            min="0"
          />
        </div>

        {/* Currency */}
        <div className="space-y-2 mb-6">
          <label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
            Moeda
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="neon-input w-full rounded-lg px-4 py-3 text-sm"
          >
            {availableCurrencies.map((c) => (
              <option key={c} value={c} style={{ background: '#0F1117' }}>{c}</option>
            ))}
          </select>
          {selectedWallet && (
            <p className="nex-mono text-[10px]" style={{ color: '#606060' }}>
              Saldo atual: <span style={{ color: '#00D4AA' }}>{fmt(selectedWallet.balance_available, currency)}</span>
            </p>
          )}
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || depositMut.isPending}
          className="neon-btn-primary w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {depositMut.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              A gerar link de pagamento...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Gerar Link de Pagamento
            </>
          )}
        </button>

        {depositMut.isError && (
          <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: 'rgba(255,59,92,0.08)', border: '1px solid rgba(255,59,92,0.2)', color: '#FF5252' }}>
            Erro ao gerar link de pagamento. Tente novamente.
          </div>
        )}
      </div>

      {/* Success dialog */}
      <Dialog open={!!paymentLink} onOpenChange={(open) => { if (!open) setPaymentLink(null); }}>
        <DialogContent className="glass-panel p-6" style={{ background: 'rgba(14,19,27,0.95)', maxWidth: '440px' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base" style={{ color: '#00D4AA' }}>
              <CheckCircle className="w-5 h-5" />
              Link Gerado com Sucesso
            </DialogTitle>
            <DialogDescription className="nex-mono text-xs" style={{ color: '#A0A0A0' }}>
              Partilhe este link com o pagador para completar o depósito.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <div
              className="p-3 rounded-lg nex-mono text-xs break-all"
              style={{
                background: 'rgba(0,212,170,0.04)',
                border: '1px solid rgba(0,212,170,0.12)',
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
              className="neon-btn-primary flex-1 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2"
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
                  background: 'rgba(0,180,216,0.08)',
                  border: '1px solid rgba(0,180,216,0.25)',
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
