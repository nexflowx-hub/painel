'use client';

import { useState } from 'react';
import { useWallets, usePayout } from '@/hooks/use-wallets';
import { Banknote, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { Wallet, PayoutMethod } from '@/lib/api/contracts';

const methods: { value: PayoutMethod; label: string; icon: string }[] = [
  { value: 'IBAN', label: 'IBAN', icon: '🏦' },
  { value: 'SEPA', label: 'SEPA', icon: '🇪🇺' },
  { value: 'PIX', label: 'PIX', icon: '⚡' },
  { value: 'CRYPTO', label: 'Crypto', icon: '🔗' },
  { value: 'BANK', label: 'Bank Transfer', icon: '💳' },
];

function fmt(n: number, code: string) {
  try {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: code, minimumFractionDigits: 2 }).format(n);
  } catch {
    return `${code} ${n.toFixed(2)}`;
  }
}

export default function PayoutWidget() {
  const { data: wallets } = useWallets();
  const payoutMut = usePayout();
  const allWallets: Wallet[] = wallets ?? [];

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [method, setMethod] = useState<PayoutMethod>('IBAN');
  const [destination, setDestination] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedWallet = allWallets.find((w) => w.currency_code === currency);
  const parsedAmount = parseFloat(amount) || 0;

  const canSubmit = parsedAmount > 0 && destination.trim().length > 0 &&
    selectedWallet && parsedAmount <= selectedWallet.balance_available;

  const handleSubmit = () => {
    if (canSubmit) setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      await payoutMut.mutateAsync({
        amount: parsedAmount,
        currency,
        method,
        destination: destination.trim(),
      });
      setConfirmOpen(false);
      setSuccess(true);
      setAmount('');
      setDestination('');
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      // error handled by mutation
    }
  };

  const availableCurrencies = [...new Set(allWallets.map((w) => w.currency_code))];

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-up">
      {success && (
        <div
          className="glass-panel p-4 flex items-center gap-3 animate-fade-up"
          style={{ borderColor: 'rgba(0,212,170,0.2)' }}
        >
          <CheckCircle className="w-5 h-5" style={{ color: '#00D4AA' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: '#00D4AA' }}>Levantamento solicitado com sucesso!</p>
            <p className="nex-mono text-[11px]" style={{ color: '#A0A0A0' }}>O pedido será processado em breve.</p>
          </div>
        </div>
      )}

      <div className="glass-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <Banknote className="w-5 h-5" style={{ color: '#FFB800' }} />
          <h3 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>Solicitar Levantamento</h3>
        </div>

        {/* Amount */}
        <div className="space-y-2 mb-4">
          <label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
            Montante
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="neon-input w-full rounded-lg px-4 py-3 text-sm nex-mono"
            placeholder="0.00"
            min="0"
          />
          {selectedWallet && (
            <p className="nex-mono text-[10px]" style={{ color: '#606060' }}>
              Disponível: <span style={{ color: '#00D4AA' }}>{fmt(selectedWallet.balance_available, currency)}</span>
            </p>
          )}
        </div>

        {/* Currency */}
        <div className="space-y-2 mb-4">
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
        </div>

        {/* Method */}
        <div className="space-y-2 mb-4">
          <label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
            Método de Levantamento
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {methods.map((m) => (
              <button
                key={m.value}
                onClick={() => setMethod(m.value)}
                className={`p-3 rounded-lg text-center transition-all text-xs ${
                  method === m.value ? 'glow-box-subtle' : ''
                }`}
                style={{
                  background: method === m.value ? `${m.value === 'CRYPTO' ? 'rgba(168,85,247,0.1)' : m.value === 'PIX' ? 'rgba(255,184,0,0.1)' : 'rgba(0,212,170,0.08)'}` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${method === m.value ? (m.value === 'CRYPTO' ? 'rgba(168,85,247,0.3)' : m.value === 'PIX' ? 'rgba(255,184,0,0.3)' : 'rgba(0,212,170,0.25)') : 'rgba(255,255,255,0.05)'}`,
                  color: method === m.value ? '#FFFFFF' : '#A0A0A0',
                }}
              >
                <div className="text-lg mb-1">{m.icon}</div>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Destination */}
        <div className="space-y-2 mb-6">
          <label className="nex-mono text-[10px] uppercase tracking-wider" style={{ color: '#A0A0A0' }}>
            {method === 'CRYPTO' ? 'Endereço da Carteira' : method === 'PIX' ? 'Chave PIX' : 'IBAN / Conta Destino'}
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="neon-input w-full rounded-lg px-4 py-3 text-sm nex-mono"
            placeholder={
              method === 'CRYPTO' ? '0x...' :
              method === 'PIX' ? 'email@exemplo.com / CPF / Telefone' :
              'PT50 0000 0000 0000 0000 0000 0'
            }
          />
        </div>

        {/* Fee summary */}
        <div
          className="p-3 rounded-lg mb-6"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div className="flex justify-between nex-mono text-xs mb-1">
            <span style={{ color: '#A0A0A0' }}>Montante</span>
            <span style={{ color: '#FFFFFF' }}>{fmt(parsedAmount, currency)}</span>
          </div>
          <div className="flex justify-between nex-mono text-xs">
            <span style={{ color: '#A0A0A0' }}>Taxas</span>
            <span style={{ color: '#FFB800' }}>Calculadas pelo servidor</span>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="neon-btn-primary w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Banknote className="w-4 h-4" />
          Solicitar Levantamento
        </button>

        {payoutMut.isError && (
          <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: 'rgba(255,59,92,0.08)', border: '1px solid rgba(255,59,92,0.2)', color: '#FF5252' }}>
            Erro ao solicitar levantamento. Tente novamente.
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="glass-panel p-6" style={{ background: 'rgba(14,19,27,0.95)', maxWidth: '440px' }}>
          <DialogHeader>
            <DialogTitle className="text-base" style={{ color: '#FFFFFF' }}>
              <AlertTriangle className="w-5 h-5 inline mr-2" style={{ color: '#FFB800' }} />
              Confirmar Levantamento
            </DialogTitle>
            <DialogDescription className="nex-mono text-xs" style={{ color: '#A0A0A0' }}>
              Verifique os dados antes de confirmar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 my-4">
            <div className="flex justify-between nex-mono text-xs">
              <span style={{ color: '#A0A0A0' }}>Montante</span>
              <span style={{ color: '#FFFFFF' }}>{fmt(parsedAmount, currency)}</span>
            </div>
            <div className="flex justify-between nex-mono text-xs">
              <span style={{ color: '#A0A0A0' }}>Método</span>
              <span style={{ color: '#FFFFFF' }}>{method}</span>
            </div>
            <div className="flex justify-between nex-mono text-xs">
              <span style={{ color: '#A0A0A0' }}>Destino</span>
              <span className="nex-mono text-xs truncate ml-4" style={{ color: '#00B4D8', maxWidth: '200px' }}>
                {destination}
              </span>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setConfirmOpen(false)}
              className="px-4 py-2 rounded-lg text-xs transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#A0A0A0' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={payoutMut.isPending}
              className="neon-btn-primary px-4 py-2 rounded-lg text-xs flex items-center gap-2 disabled:opacity-40"
            >
              {payoutMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              Confirmar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
