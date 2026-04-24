'use client';

import { useState, useMemo } from 'react';
import { useWallets, useSwap } from '@/hooks/use-wallets';
import { ArrowLeftRight, Loader2, Info } from 'lucide-react';
import type { Wallet } from '@/lib/api/contracts';

function fmt(n: number, code: string) {
  try {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: code, minimumFractionDigits: 2 }).format(n);
  } catch {
    return `${code} ${n.toFixed(2)}`;
  }
}

export default function SwapWidget() {
  const { data: wallets } = useWallets();
  const swapMut = useSwap();
  const allWallets: Wallet[] = wallets ?? [];

  const availableCurrencies = useMemo(
    () => [...new Set(allWallets.map((w) => w.currency_code))],
    [allWallets],
  );

  const defaultFrom = availableCurrencies[0] || 'EUR';
  const defaultTo = availableCurrencies.length > 1 ? availableCurrencies[1] : defaultFrom;

  const [fromCurrency, setFromCurrency] = useState(defaultFrom);
  const [toCurrency, setToCurrency] = useState(defaultTo);
  const [amount, setAmount] = useState('');

  const fromWallet = allWallets.find((w) => w.currency_code === fromCurrency);
  const toWallet = allWallets.find((w) => w.currency_code === toCurrency);

  const parsedAmount = parseFloat(amount) || 0;

  const canSwap = parsedAmount > 0 && fromCurrency !== toCurrency && fromWallet && parsedAmount <= fromWallet.balance_available;

  const handleSwap = async () => {
    if (!canSwap) return;
    try {
      await swapMut.mutateAsync({
        amount: parsedAmount,
        from_currency: fromCurrency,
        to_currency: toCurrency,
      });
      setAmount('');
    } catch {
      // error handled by mutation
    }
  };

  const handleInvert = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-up">
      <div className="glass-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <ArrowLeftRight className="w-5 h-5" style={{ color: '#00D4AA' }} />
          <h3 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>Converter Moeda</h3>
        </div>

        {/* From */}
        <div className="space-y-2 mb-4">
          <label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
            De
          </label>
          <div className="flex gap-2">
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="neon-input rounded-lg px-3 py-3 text-sm w-28"
            >
              {availableCurrencies.map((c) => (
                <option key={c} value={c} style={{ background: '#0F1117' }}>{c}</option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="neon-input flex-1 rounded-lg px-4 py-3 text-sm nex-mono"
              placeholder="0.00"
              min="0"
            />
          </div>
          {fromWallet && (
            <p className="nex-mono text-[10px]" style={{ color: '#606060' }}>
              Disponível: <span style={{ color: '#00D4AA' }}>{fmt(fromWallet.balance_available, fromCurrency)}</span>
            </p>
          )}
        </div>

        {/* Invert button */}
        <div className="flex justify-center -my-2">
          <button
            onClick={handleInvert}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: 'rgba(0,212,170,0.08)',
              border: '1px solid rgba(0,212,170,0.2)',
              color: '#00D4AA',
            }}
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* To */}
        <div className="space-y-2 mb-6 mt-4">
          <label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
            Para
          </label>
          <div className="flex gap-2">
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="neon-input rounded-lg px-3 py-3 text-sm w-28"
            >
              {availableCurrencies.map((c) => (
                <option key={c} value={c} style={{ background: '#0F1117' }}>{c}</option>
              ))}
            </select>
            <div
              className="flex-1 rounded-lg px-4 py-3 text-sm nex-mono"
              style={{
                background: 'rgba(0,212,170,0.04)',
                border: '1px solid rgba(0,212,170,0.1)',
                color: '#00D4AA',
              }}
            >
              {toWallet && (
                <span className="nex-mono text-[10px]" style={{ color: '#606060' }}>
                  Saldo: {fmt(toWallet.balance_available, toCurrency)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Rate info */}
        <div
          className="flex items-start gap-2 p-3 rounded-lg mb-6"
          style={{ background: 'rgba(0,180,216,0.04)', border: '1px solid rgba(0,180,216,0.1)' }}
        >
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#00B4D8' }} />
          <div className="nex-mono text-[11px] space-y-1" style={{ color: '#A0A0A0' }}>
            <p>Taxa de câmbio definida no momento da execução.</p>
            <p>Taxas e comissões calculadas pelo servidor.</p>
          </div>
        </div>

        {/* Swap button */}
        <button
          onClick={handleSwap}
          disabled={!canSwap || swapMut.isPending}
          className="neon-btn-primary w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {swapMut.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              A processar câmbio...
            </>
          ) : (
            <>
              <ArrowLeftRight className="w-4 h-4" />
              Converter {fromCurrency} → {toCurrency}
            </>
          )}
        </button>

        {swapMut.isError && (
          <div
            className="mt-3 p-3 rounded-lg text-xs"
            style={{
              background: 'rgba(255,59,92,0.08)',
              border: '1px solid rgba(255,59,92,0.2)',
              color: '#FF5252',
            }}
          >
            Erro ao processar câmbio. Tente novamente.
          </div>
        )}

        {swapMut.isSuccess && (
          <div
            className="mt-3 p-3 rounded-lg text-xs"
            style={{
              background: 'rgba(0,212,170,0.06)',
              border: '1px solid rgba(0,212,170,0.2)',
              color: '#00D4AA',
            }}
          >
            Câmbio realizado com sucesso!
          </div>
        )}
      </div>
    </div>
  );
}
