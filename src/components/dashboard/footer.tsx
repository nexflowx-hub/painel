'use client'

import { Logo3D } from '@/components/ui/logo-3d'
import { useAuthStore, getUserRole, IS_DEV_MODE } from '@/lib/auth-store'
import { useI18n } from '@/lib/i18n'
import { LogOut, Terminal, Mail, Phone, Send } from 'lucide-react'

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
  { name: 'USDT', icon: 'https://cryptologos.cc/logos/tether-usdt-logo.svg' },
  { name: 'Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg' },
]

export default function Footer() {
  const { user, logout, isDevMode } = useAuthStore()
  const { t } = useI18n()
  const role = getUserRole(user)

  return (
    <footer
      className="px-4 md:px-6 py-6"
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--card)',
      }}
    >
      {/* Main footer grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Column 1: Legal Support */}
        <div>
          <p className="nex-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: 'var(--primary)' }}>
            {t('footer.legalSupport')}
          </p>
          <div className="space-y-2">
            <p className="nex-mono text-[11px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              <span style={{ color: 'var(--foreground)' }}>IAHUB360 LTD</span> · {t('footer.holding')}
            </p>
            <p className="nex-mono text-[11px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              UK Reg. 16626733
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <a href="/terms" className="nex-mono text-[10px] px-2 py-1 rounded transition-colors hover:bg-accent" style={{ color: 'var(--muted-foreground)' }}>
                {t('footer.termsService')}
              </a>
              <a href="/privacy" className="nex-mono text-[10px] px-2 py-1 rounded transition-colors hover:bg-accent" style={{ color: 'var(--muted-foreground)' }}>
                {t('footer.privacyPolicy')}
              </a>
              <a href="/refund" className="nex-mono text-[10px] px-2 py-1 rounded transition-colors hover:bg-accent" style={{ color: 'var(--muted-foreground)' }}>
                {t('footer.refundPolicy')}
              </a>
              <a href="/delivery" className="nex-mono text-[10px] px-2 py-1 rounded transition-colors hover:bg-accent" style={{ color: 'var(--muted-foreground)' }}>
                {t('footer.delivery')}
              </a>
            </div>
          </div>
        </div>

        {/* Column 2: Ecosystem */}
        <div>
          <p className="nex-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: 'var(--primary)' }}>
            {t('footer.ecosystem')}
          </p>
          <div className="space-y-2">
            <p className="nex-mono text-[11px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              <span style={{ color: 'var(--foreground)' }}>NeX-Systems</span> · {t('footer.infrastructure')}
            </p>
            <p className="nex-mono text-[11px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              <span style={{ color: 'var(--foreground)' }}>NeXTech</span> · {t('footer.operations')}
            </p>
            <p className="nex-mono text-[10px] leading-relaxed mt-2" style={{ color: 'var(--muted-foreground)' }}>
              {t('footer.complianceManifesto')}
            </p>
          </div>
        </div>

        {/* Column 3: Contact */}
        <div>
          <p className="nex-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: 'var(--primary)' }}>
            {t('footer.contact')}
          </p>
          <div className="space-y-2.5">
            <a
              href="mailto:support@atlasglobal.digital"
              className="flex items-center gap-2 nex-mono text-[11px] transition-colors hover:text-primary"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <Mail className="w-3.5 h-3.5" />
              support@atlasglobal.digital
            </a>
            <a
              href="https://t.me/AtlasCore_Support"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 nex-mono text-[11px] transition-colors hover:text-primary"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <Send className="w-3.5 h-3.5" />
              @AtlasCore_Support
            </a>
            <a
              href="tel:+447451221030"
              className="flex items-center gap-2 nex-mono text-[11px] transition-colors hover:text-primary"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <Phone className="w-3.5 h-3.5" />
              +44 74 5122 1030
            </a>
          </div>
        </div>

        {/* Column 4: Transparency */}
        <div>
          <p className="nex-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: 'var(--primary)' }}>
            {t('footer.transparency')}
          </p>
          <div className="space-y-2">
            <p className="nex-mono text-[10px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              {t('footer.dataPolicy')}
            </p>
            <p className="nex-mono text-[10px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              {t('footer.nonCustodial')}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="py-4 mb-4" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <p className="nex-mono text-[9px] uppercase tracking-widest mb-3 text-center" style={{ color: 'var(--muted-foreground)' }}>
          {t('footer.paymentMethods')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.name}
              className="flex items-center justify-center h-8 px-2 rounded transition-all hover:bg-accent"
              title={method.name}
            >
              <img
                src={method.icon}
                alt={method.name}
                className="h-5 w-auto object-contain"
                style={{ filter: 'grayscale(0.3) brightness(0.9)' }}
                onError={(e) => {
                  // Fallback to text if image fails
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML = `<span class="nex-mono text-[10px]" style="color: var(--muted-foreground)">${method.name}</span>`
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Logo3D size="footer" spin={false} showRing={false} />
          <span className="nex-mono text-[10px] whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
            © 2026 Atlas Global Payments. Powered by NeXFlowX™
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="nex-mono text-[10px] hidden sm:block" style={{ color: 'var(--muted-foreground)' }}>
              {user.username} · <span className="uppercase">{role}</span>
            </span>
          )}
          {IS_DEV_MODE && isDevMode && (
            <div className="dev-badge hidden md:flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              DEV
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all hover:bg-destructive/10"
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
