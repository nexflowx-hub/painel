'use client';

import { useEffect, useRef } from 'react';

/**
 * TradingViewTicker - Real-time Crypto/Fiat Ticker Tape
 * Displays: BTC/USD, ETH/EUR, USDT/EUR, EUR/BRL, USD/BRL
 * Uses TradingView's free widget
 * Styled with black background for harmonious integration
 */

export default function TradingViewTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetLoaded = useRef(false);

  useEffect(() => {
    if (widgetLoaded.current || !containerRef.current) return;
    widgetLoaded.current = true;

    // Clear any existing content
    containerRef.current.innerHTML = '';

    // Create the TradingView widget script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        {
          proName: 'BINANCE:BTCUSDT',
          title: 'BTC/USD',
        },
        {
          proName: 'BINANCE:ETHEUR',
          title: 'ETH/EUR',
        },
        {
          proName: 'BINANCE:USDTEUR',
          title: 'USDT/EUR',
        },
        {
          proName: 'FX_IDC:EURBRL',
          title: 'EUR/BRL',
        },
        {
          proName: 'FX_IDC:USDBRL',
          title: 'USD/BRL',
        },
      ],
      showSymbolLogo: false,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'pt_PT',
    });

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    
    containerRef.current.appendChild(widgetContainer);
    containerRef.current.appendChild(script);

    return () => {
      widgetLoaded.current = false;
    };
  }, []);

  return (
    <div 
      className="w-full overflow-hidden relative"
    >
      {/* Subtle top border glow */}
      <div 
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.3), rgba(0, 180, 216, 0.25), transparent)',
        }}
      />
      
      <div 
        ref={containerRef}
        className="tradingview-widget-container relative z-10"
        style={{
          height: '46px',
          backgroundColor: 'transparent',
        }}
      />
      
      {/* Subtle bottom border */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.15), transparent)',
        }}
      />
    </div>
  );
}
