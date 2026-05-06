"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ArrowDownUp, Settings2, Info, Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { swapApi, publicApi, type ExchangeRate } from "@/lib/api/atlas-client";
import { useQueryClient } from "@tanstack/react-query";
import type { SwapRequest, SwapResponse, Currency } from "@/types/atlas";

const CURRENCIES = [
  { code: "EUR", name: "Euro", type: "fiat", icon: "🇪🇺" },
  { code: "BRL", name: "Real", type: "fiat", icon: "🇧🇷" },
  { code: "USDT", name: "Tether", type: "crypto", icon: "🟢" },
  { code: "USD", name: "Dollar", type: "fiat", icon: "🇺🇸" },
];

/** Cross-rate calculator from API rates (all base: USDT) */
function crossRate(rates: ExchangeRate[], from: string, to: string): number {
  if (from === to) return 1;

  // Build rate map: currency → rate relative to USDT
  const rateMap: Record<string, number> = { USDT: 1 };
  for (const r of rates) {
    rateMap[r.currency] = r.rate;
  }

  const fromToUsdt = rateMap[from] ?? 1;   // how many USDT per 1 unit of `from`
  const toToUsdt = rateMap[to] ?? 1;       // how many USDT per 1 unit of `to`

  // Convert: from → USDT → to
  return fromToUsdt / toToUsdt;
}

export default function SwapWidget() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("0.00");
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("USDT");
  const [isSwapping, setIsSwapping] = useState(false);
  const [showDropdown, setShowDropdown] = useState<"from" | "to" | null>(null);

  // ── Fetch live rates from API ──
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState(false);
  const [ratesTimestamp, setRatesTimestamp] = useState<string | null>(null);

  const fetchRates = async () => {
    setRatesLoading(true);
    setRatesError(false);
    try {
      const data = await publicApi.rates();
      if (Array.isArray(data) && data.length > 0) {
        setRates(data);
        setRatesTimestamp(data[0].timestamp);
      }
    } catch {
      setRatesError(true);
    } finally {
      setRatesLoading(false);
    }
  };

  useEffect(() => { fetchRates(); }, []);

  // ── Compute exchange rate from live data ──
  const currentRate = useMemo(() => {
    if (rates.length === 0) return 1;
    return crossRate(rates, fromCurrency, toCurrency);
  }, [rates, fromCurrency, toCurrency]);

  // ── Swap fee (simulated from TierConfig) ──
  const swapFeePercent = 1.5;

  // ── Calculate conversion ──
  useEffect(() => {
    if (!fromAmount || isNaN(Number(fromAmount))) {
      setToAmount("0.00");
      return;
    }
    const rawAmount = Number(fromAmount) * currentRate;
    const fee = rawAmount * (swapFeePercent / 100);
    const result = rawAmount - fee;
    setToAmount(result.toFixed(6));
  }, [fromAmount, fromCurrency, toCurrency, currentRate, swapFeePercent]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount("");
  };

  const executeSwap = async () => {
    if (!fromAmount || Number(fromAmount) <= 0) return;

    setIsSwapping(true);

    try {
      const payload: SwapRequest = {
        fromCurrency: fromCurrency as Currency,
        toCurrency: toCurrency as Currency,
        amount: Number(fromAmount),
      };

      const result: SwapResponse = await swapApi.execute(payload);

      if (result.success) {
        toast({
          title: "Câmbio Realizado com Sucesso!",
          description: `Convertido ${result.from.amount} ${result.from.currency} → ${result.to.amount.toFixed(6)} ${result.to.currency}`,
          action: <CheckCircle className="w-5 h-5 text-green-500" />,
        });

        setFromAmount("");

        await queryClient.invalidateQueries({ queryKey: ['wallets'] });
        await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      } else {
        throw new Error("Swap falhou");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        variant: "destructive",
        title: "Erro no Câmbio",
        description: errorMessage || "Não foi possível completar a operação. Tente novamente.",
        action: <XCircle className="w-5 h-5" />,
      });
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Glow de fundo */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#00D4AA] to-[#00B4D8] rounded-2xl blur-lg opacity-15"></div>

      <div className="relative glass-panel rounded-2xl p-4 md:p-6">

        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Conversão Instantânea</h2>
          <div className="flex items-center gap-1">
            {ratesLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#00D4AA' }} />
            ) : ratesError ? (
              <button
                onClick={fetchRates}
                className="p-1.5 rounded hover:bg-white/5 transition-colors"
                title="Recarregar taxas"
              >
                <RefreshCw className="w-4 h-4" style={{ color: '#EF4444' }} />
              </button>
            ) : (
              <button
                onClick={fetchRates}
                className="p-1.5 rounded hover:bg-white/5 transition-colors"
                title="Recarregar taxas"
              >
                <RefreshCw className="w-4 h-4" style={{ color: '#00D4AA' }} />
              </button>
            )}
            <span className="nex-mono text-[9px] ml-1" style={{ color: '#606060' }}>
              LIVE
            </span>
          </div>
        </div>

        {/* Input Pagas */}
        <div className="bg-[#0d1017] rounded-xl p-4 border border-white/5 hover:border-[#00D4AA]/30 transition-colors">
          <label className="text-xs font-medium text-gray-400 mb-2 block">Pagas</label>
          <div className="flex items-center justify-between gap-3">
            <input
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="bg-transparent text-3xl font-semibold text-white w-full outline-none placeholder:text-gray-600"
            />

            {/* Botão Seletor Customizado */}
            <button
              onClick={() => setShowDropdown("from")}
              className="flex items-center gap-2 bg-[#1a1f28] hover:bg-[#242a36] px-3 py-2 rounded-lg transition-colors border border-white/5 whitespace-nowrap"
            >
              <span className="text-lg">{CURRENCIES.find(c => c.code === fromCurrency)?.icon}</span>
              <span className="text-white font-medium">{fromCurrency}</span>
            </button>
          </div>
        </div>

        {/* Botão Inverter (Posição Absoluta) */}
        <div className="relative flex justify-center -my-3 z-10">
          <button
            onClick={handleSwapCurrencies}
            className="bg-[#1a1f28] border-4 border-[#0d1017] rounded-full p-2 hover:bg-[#00D4AA] hover:text-[#080a0f] text-gray-400 transition-all"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
        </div>

        {/* Input Recebes */}
        <div className="bg-[#0d1017] rounded-xl p-4 border border-white/5 mb-6">
          <label className="text-xs font-medium text-gray-400 mb-2 block">Recebes (Estimado)</label>
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              readOnly
              value={toAmount}
              className="bg-transparent text-3xl font-semibold text-gray-300 w-full outline-none"
            />
            <button
              onClick={() => setShowDropdown("to")}
              className="flex items-center gap-2 bg-[#1a1f28] hover:bg-[#242a36] px-3 py-2 rounded-lg transition-colors border border-white/5 whitespace-nowrap"
            >
              <span className="text-lg">{CURRENCIES.find(c => c.code === toCurrency)?.icon}</span>
              <span className="text-white font-medium">{toCurrency}</span>
            </button>
          </div>
        </div>

        {/* Painel de Recibo */}
        {fromAmount && Number(fromAmount) > 0 && (
          <div className="bg-[#080a0f] rounded-lg p-3 mb-6 text-sm border border-white/5 space-y-2">
            <div className="flex justify-between text-gray-400">
              <span>Cotação</span>
              <span className="text-white">1 {fromCurrency} = {currentRate.toFixed(6)} {toCurrency}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span className="flex items-center gap-1">Taxa de Serviço <Info className="w-3 h-3"/></span>
              <span className="text-[#FFB800]">{swapFeePercent.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Fonte de Taxas</span>
              <span className="text-[#00D4AA]">
                {ratesError ? 'Offline (fallback)' : ratesLoading ? 'A carregar...' : 'Atlas Core API'}
              </span>
            </div>
            {ratesTimestamp && (
              <div className="flex justify-between">
                <span className="nex-mono text-[9px]" style={{ color: '#444' }}>
                  Última atualização
                </span>
                <span className="nex-mono text-[9px]" style={{ color: '#444' }}>
                  {new Date(ratesTimestamp).toLocaleTimeString('pt-PT')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button
          className="w-full py-6 text-lg font-bold transition-all"
          style={{
            background: 'linear-gradient(135deg, #00D4AA, #00B4D8)',
            boxShadow: '0 0 20px rgba(0, 212, 170, 0.3)',
          }}
          onClick={executeSwap}
          disabled={!fromAmount || Number(fromAmount) <= 0 || isSwapping || ratesLoading}
        >
          {isSwapping ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              A processar...
            </span>
          ) : (
            "Confirmar Câmbio"
          )}
        </Button>

        {/* Dropdown Overlay Absoluto */}
        {showDropdown && (
          <div className="absolute inset-0 z-50 bg-[#0d1017]/98 backdrop-blur-sm rounded-2xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Selecionar Moeda</h3>
              <button
                onClick={() => setShowDropdown(null)}
                className="text-gray-400 hover:text-white px-3 py-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                Fechar
              </button>
            </div>
            <div className="space-y-2 overflow-y-auto cyber-scrollbar">
              {CURRENCIES.map((currency) => (
                <button
                  key={currency.code}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#1a1f28] text-left transition-colors border border-transparent hover:border-white/10"
                  onClick={() => {
                    if (showDropdown === "from") setFromCurrency(currency.code);
                    else setToCurrency(currency.code);
                    setShowDropdown(null);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{currency.icon}</span>
                    <div>
                      <div className="text-white font-bold">{currency.code}</div>
                      <div className="text-gray-400 text-xs">{currency.name}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 uppercase">{currency.type}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
