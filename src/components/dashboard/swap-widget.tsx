"use client";

import React, { useState, useEffect } from "react";
import { ArrowDownUp, Settings2, Info, Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { swapApi } from "@/lib/api/atlas-client";
import { useQueryClient } from "@tanstack/react-query";
import type { SwapRequest, SwapResponse, Currency } from "@/types/atlas";

const CURRENCIES = [
  { code: "EUR", name: "Euro", type: "fiat", icon: "🇪🇺" },
  { code: "BRL", name: "Real", type: "fiat", icon: "🇧🇷" },
  { code: "USDT", name: "Tether", type: "crypto", icon: "🟢" },
  { code: "USD", name: "Dollar", type: "fiat", icon: "🇺🇸" },
];

export default function SwapWidget() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("0.00");
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("USDT");
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState<"from" | "to" | null>(null);

  // Simulação de Orquestração de Rota (NeXFlowX Core Engine)
  const resolveProvider = (from: string, to: string) => {
    if (from === "EUR" && to === "USDT") return { name: "Guardarian", rate: 1.08 };
    if (from === "BRL" || to === "BRL") return { name: "Onramp.money", rate: 0.19 };
    if (from === "USDT" && to === "EUR") return { name: "NeXFlowX Pool", rate: 0.92 };
    if (from === "USDT" && to === "BTC") return { name: "NOWPayments", rate: 0.000015 };
    if (from === "USD" && to === "EUR") return { name: "NeXFlowX Pool", rate: 0.92 };
    if (from === "EUR" && to === "USD") return { name: "NeXFlowX Pool", rate: 1.09 };
    return { name: "NeXFlowX Pool", rate: 1.0 }; // Rota padrão
  };

  const routePlan = resolveProvider(fromCurrency, toCurrency);

  // Calcula valores quando o input muda
  useEffect(() => {
    if (!fromAmount || isNaN(Number(fromAmount))) {
      setToAmount("0.00");
      return;
    }
    const rawAmount = Number(fromAmount) * routePlan.rate;
    const fee = rawAmount * 0.015; // Simulação de 1.5% do TierConfig
    setToAmount((rawAmount - fee).toFixed(6));
  }, [fromAmount, fromCurrency, toCurrency, routePlan.rate]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount("");
  };

  const executeSwap = async () => {
    if (!fromAmount || Number(fromAmount) <= 0) return;
    
    setIsLoading(true);
    
    try {
      // Chamar a API real via atlas-client
      const payload: SwapRequest = {
        fromCurrency: fromCurrency as Currency,
        toCurrency: toCurrency as Currency,
        amount: Number(fromAmount),
      };

      const result: SwapResponse = await swapApi.execute(payload);

      if (result.success) {
        toast({
          title: "Câmbio Realizado com Sucesso!",
          description: `Convertido ${result.from.amount} ${result.from.currency} → ${result.to.amount.toFixed(6)} ${result.to.currency} via ${routePlan.name}`,
          action: <CheckCircle className="w-5 h-5 text-green-500" />,
        });
        
        // Limpar input
        setFromAmount("");
        
        // Atualizar saldos (invalidar cache do React Query)
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
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Glow de fundo - Cores harmoniosas Atlas */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#00D4AA] to-[#00B4D8] rounded-2xl blur-lg opacity-15"></div>
      
      <div className="relative glass-panel rounded-2xl p-4 md:p-6">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Conversão Instantânea</h2>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5">
            <Settings2 className="w-5 h-5" />
          </Button>
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
              <span className="text-white">1 {fromCurrency} = {routePlan.rate} {toCurrency}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span className="flex items-center gap-1">Taxa NeXFlowX <Info className="w-3 h-3"/></span>
              <span className="text-[#FFB800]">1.50%</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Motor de Liquidez</span>
              <span className="text-[#00D4AA]">{routePlan.name}</span>
            </div>
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
          disabled={!fromAmount || Number(fromAmount) <= 0 || isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              A processar...
            </span>
          ) : (
            "Confirmar Câmbio"
          )}
        </Button>

        {/* Dropdown Overlay Absoluto (Z-Index máximo) */}
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
