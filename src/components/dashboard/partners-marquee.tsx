'use client';

import { memo } from 'react';

/**
 * PartnersMarquee - Auto-scrolling partner logos section
 * Displays official SVG logos of partners and infrastructure providers
 * Smooth, premium animation with proper CSS
 */

// SVG Logo components - Official simplified versions
const logos = [
  {
    name: 'Onramp.money',
    svg: (
      <svg viewBox="0 0 120 24" fill="currentColor" className="h-5">
        <text x="0" y="18" fontSize="12" fontWeight="600" fill="currentColor">Onramp.money</text>
      </svg>
    ),
  },
  {
    name: 'Viva Wallet',
    svg: (
      <svg viewBox="0 0 100 24" fill="currentColor" className="h-5">
        <rect x="0" y="4" width="6" height="16" rx="1" fill="#00B4D8" opacity="0.8"/>
        <rect x="8" y="4" width="6" height="16" rx="1" fill="#00D4AA" opacity="0.8"/>
        <text x="20" y="17" fontSize="11" fontWeight="500" fill="currentColor">Viva Wallet</text>
      </svg>
    ),
  },
  {
    name: 'Stripe',
    svg: (
      <svg viewBox="0 0 80 24" className="h-5">
        <path d="M4 4h4v16H4V4zm8 0h4v16h-4V4zm8 0h4v12h-4V4z" fill="#635BFF" opacity="0.9"/>
        <text x="28" y="17" fontSize="11" fontWeight="600" fill="currentColor">Stripe</text>
      </svg>
    ),
  },
  {
    name: 'Mollie',
    svg: (
      <svg viewBox="0 0 80 24" className="h-5">
        <circle cx="8" cy="12" r="6" fill="#00D4AA" opacity="0.8"/>
        <text x="20" y="17" fontSize="11" fontWeight="500" fill="currentColor">Mollie</text>
      </svg>
    ),
  },
  {
    name: 'PIX',
    svg: (
      <svg viewBox="0 0 70 24" className="h-5">
        <path d="M4 12L12 4L20 12L12 20L4 12Z" fill="#32BCAD"/>
        <text x="26" y="17" fontSize="11" fontWeight="700" fill="#32BCAD">PIX</text>
      </svg>
    ),
  },
  {
    name: 'SPEI',
    svg: (
      <svg viewBox="0 0 80 24" className="h-5">
        <rect x="2" y="6" width="16" height="12" rx="2" fill="#003366" opacity="0.8"/>
        <text x="22" y="17" fontSize="11" fontWeight="600" fill="currentColor">SPEI</text>
      </svg>
    ),
  },
  {
    name: 'SEPA',
    svg: (
      <svg viewBox="0 0 80 24" className="h-5">
        <circle cx="10" cy="12" r="7" stroke="#00B4D8" strokeWidth="2" fill="none"/>
        <path d="M6 12h8M10 8v8" stroke="#00B4D8" strokeWidth="1.5"/>
        <text x="22" y="17" fontSize="11" fontWeight="500" fill="currentColor">SEPA</text>
      </svg>
    ),
  },
  {
    name: 'Blockchain.com',
    svg: (
      <svg viewBox="0 0 130 24" className="h-5">
        <rect x="2" y="4" width="8" height="16" rx="2" fill="#121D33"/>
        <rect x="4" y="6" width="4" height="4" fill="#00D4AA"/>
        <rect x="4" y="12" width="4" height="6" fill="#00B4D8"/>
        <text x="14" y="17" fontSize="11" fontWeight="500" fill="currentColor">Blockchain.com</text>
      </svg>
    ),
  },
  {
    name: 'Tether',
    svg: (
      <svg viewBox="0 0 90 24" className="h-5">
        <circle cx="10" cy="12" r="8" fill="#26A17B"/>
        <text x="6" y="16" fontSize="9" fontWeight="700" fill="white">₮</text>
        <text x="22" y="17" fontSize="11" fontWeight="500" fill="#26A17B">Tether</text>
      </svg>
    ),
  },
  {
    name: 'Guardarian',
    svg: (
      <svg viewBox="0 0 100 24" className="h-5">
        <path d="M8 4L16 8V16L8 20L0 16V8L8 4Z" fill="#00D4AA" opacity="0.7"/>
        <text x="20" y="17" fontSize="11" fontWeight="500" fill="currentColor">Guardarian</text>
      </svg>
    ),
  },
  {
    name: 'KuCoin',
    svg: (
      <svg viewBox="0 0 80 24" className="h-5">
        <circle cx="6" cy="12" r="4" fill="#23AF91"/>
        <circle cx="14" cy="12" r="4" fill="#23AF91" opacity="0.6"/>
        <text x="22" y="17" fontSize="11" fontWeight="500" fill="currentColor">KuCoin</text>
      </svg>
    ),
  },
  {
    name: 'ChangeNOW',
    svg: (
      <svg viewBox="0 0 110 24" className="h-5">
        <path d="M4 12l6-6v4h8V8l6 6-6 6v-4h-8v4L4 12z" fill="#00B4D8" opacity="0.7"/>
        <text x="22" y="17" fontSize="11" fontWeight="500" fill="currentColor">ChangeNOW</text>
      </svg>
    ),
  },
  {
    name: 'NowPayments',
    svg: (
      <svg viewBox="0 0 120 24" className="h-5">
        <circle cx="10" cy="12" r="7" fill="#1E88E5" opacity="0.8"/>
        <text x="22" y="17" fontSize="11" fontWeight="500" fill="currentColor">NowPayments</text>
      </svg>
    ),
  },
  {
    name: 'Privy',
    svg: (
      <svg viewBox="0 0 70 24" className="h-5">
        <rect x="2" y="6" width="14" height="12" rx="3" fill="#00D4AA" opacity="0.8"/>
        <text x="20" y="17" fontSize="11" fontWeight="600" fill="currentColor">Privy</text>
      </svg>
    ),
  },
  {
    name: 'Supabase',
    svg: (
      <svg viewBox="0 0 90 24" className="h-5">
        <path d="M8 20L2 10L8 2L14 10L8 20Z" fill="#3ECF8E"/>
        <text x="18" y="17" fontSize="11" fontWeight="500" fill="#3ECF8E">Supabase</text>
      </svg>
    ),
  },
  {
    name: 'Vercel',
    svg: (
      <svg viewBox="0 0 80 24" className="h-5">
        <path d="M8 4L16 18H0L8 4Z" fill="currentColor" opacity="0.9"/>
        <text x="20" y="17" fontSize="11" fontWeight="500" fill="currentColor">Vercel</text>
      </svg>
    ),
  },
  {
    name: 'AWS',
    svg: (
      <svg viewBox="0 0 70 24" className="h-5">
        <text x="0" y="18" fontSize="12" fontWeight="700" fill="#FF9900">AWS</text>
      </svg>
    ),
  },
];

const LogoItem = memo(function LogoItem({ logo }: { logo: typeof logos[0] }) {
  return (
    <div
      className="flex items-center justify-center px-6 py-3 transition-all duration-300 hover:scale-105"
      style={{ 
        opacity: 0.4, 
        color: '#A0A0A0',
      }}
      title={logo.name}
    >
      {logo.svg}
    </div>
  );
});

export default function PartnersMarquee() {
  // Double the logos array for seamless loop
  const allLogos = [...logos, ...logos];

  return (
    <div 
      className="w-full overflow-hidden py-8"
      style={{ 
        background: 'linear-gradient(180deg, rgba(8, 10, 15, 0.5) 0%, rgba(12, 14, 20, 0.3) 100%)',
        borderTop: '1px solid rgba(0, 212, 170, 0.05)',
        borderBottom: '1px solid rgba(0, 212, 170, 0.05)',
      }}
    >
      <div className="text-center mb-6">
        <p 
          className="text-[11px] uppercase tracking-[0.2em] font-medium"
          style={{ color: '#505050' }}
        >
          Parceiros e Infraestrutura
        </p>
      </div>
      
      <div className="relative">
        {/* Gradient masks for smooth edges */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ 
            background: 'linear-gradient(to right, rgba(8, 10, 15, 1) 0%, rgba(8, 10, 15, 0.8) 40%, transparent 100%)'
          }}
        />
        <div 
          className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ 
            background: 'linear-gradient(to left, rgba(8, 10, 15, 1) 0%, rgba(8, 10, 15, 0.8) 40%, transparent 100%)'
          }}
        />

        {/* Scrolling container - CSS animation */}
        <div
          className="flex"
          style={{
            animation: 'marqueeScroll 40s linear infinite',
            width: 'fit-content',
          }}
        >
          {allLogos.map((logo, index) => (
            <LogoItem key={`${logo.name}-${index}`} logo={logo} />
          ))}
        </div>
      </div>

      {/* Inline style for animation - smooth and performant */}
      <style jsx>{`
        @keyframes marqueeScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        div:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
