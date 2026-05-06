'use client'

import { Logo3D } from '@/components/ui/logo-3d'
import { useAuthStore, getUserRole } from '@/lib/auth-store'
import { useI18n } from '@/lib/i18n'
import { LogOut, ExternalLink } from 'lucide-react'
import Link from 'next/link'

// Payment method icons using local SVGs
const paymentMethods = [
  { name: 'Visa', icon: '/payments/visa.svg' },
  { name: 'Mastercard', icon: '/payments/mastercard.svg' },
  { name: 'Apple Pay', icon: '/payments/apay.svg' },
  { name: 'Google Pay', icon: '/payments/gpay.svg' },
  { name: 'SEPA', icon: '/payments/sepa.svg' },
  { name: 'Multibanco', icon: '/payments/multibanco.svg' },
  { name: 'Bizum', icon: '/payments/bizum.svg' },
  { name: 'PIX', icon: '/payments/pix.svg' },
]

export default function Footer() {
  const { user, logout } = useAuthStore()
  const { t } = useI18n()
  const role = getUserRole(user)

  return (
    <footer
      className="px-4 md:px-6 py-5"
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--card)',
      }}
    >
      {/* Payment Methods - Compact Row */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        {paymentMethods.map((method) => (
          <div
            key={method.name}
            className="flex items-center justify-center h-6"
            title={method.name}
          >
            <img
              src={method.icon}
              alt={method.name}
              className="h-4 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>

      {/* Main footer row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Logo & Copyright */}
        <div className="flex items-center gap-3">
          <Logo3D size="footer" spin={false} showRing={false} />
          <div className="flex flex-col">
            <span className="nex-mono text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
              © 2026 Atlas Core Banking
            </span>
            <span className="nex-mono text-[9px]" style={{ color: 'var(--muted-foreground)' }}>
              NeXFlowX Technologies
            </span>
          </div>
        </div>

        {/* Center: Legal Links */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <Link 
            href="/legal/terms" 
            className="nex-mono text-[10px] px-2 py-1 rounded transition-colors hover:bg-accent hover:text-primary"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {t('footer.termsService')}
          </Link>
          <span style={{ color: 'var(--border)' }}>·</span>
          <Link 
            href="/legal/privacy" 
            className="nex-mono text-[10px] px-2 py-1 rounded transition-colors hover:bg-accent hover:text-primary"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {t('footer.privacyPolicy')}
          </Link>
          <span style={{ color: 'var(--border)' }}>·</span>
          <Link 
            href="/legal/refund" 
            className="nex-mono text-[10px] px-2 py-1 rounded transition-colors hover:bg-accent hover:text-primary"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {t('footer.refundPolicy')}
          </Link>
          <span style={{ color: 'var(--border)' }}>·</span>
          <a 
            href="https://www.atlasglobal.digital" 
            target="_blank"
            rel="noopener noreferrer"
            className="nex-mono text-[10px] px-2 py-1 rounded transition-colors hover:bg-accent hover:text-primary flex items-center gap-1"
            style={{ color: 'var(--muted-foreground)' }}
          >
            atlasglobal.digital
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        {/* Right: User & Logout */}
        <div className="flex items-center gap-3">
          {user && (
            <span className="nex-mono text-[10px] hidden sm:block" style={{ color: 'var(--muted-foreground)' }}>
              {user.fullName || user.email || 'User'} · <span className="uppercase">{role}</span>
            </span>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] transition-all hover:bg-destructive/10"
            style={{
              background: 'rgba(255,59,92,0.06)',
              border: '1px solid rgba(255,59,92,0.15)',
              color: '#FF5252',
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('footer.logout')}</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
