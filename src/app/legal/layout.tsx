import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Legal | Atlas Core',
  description: 'Documentos legais e políticas do Atlas Core Banking',
}

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Painel
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs font-bold">A</span>
            </div>
            <span className="nex-mono text-sm font-medium">Atlas Core</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 py-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="nex-mono text-[10px] text-muted-foreground">
            © 2026 Atlas Core Banking · IAHUB360 LTD · UK Reg. 16626733
          </span>
          <div className="flex items-center gap-4">
            <Link href="/legal/terms" className="nex-mono text-[10px] text-muted-foreground hover:text-primary transition-colors">
              Termos
            </Link>
            <Link href="/legal/privacy" className="nex-mono text-[10px] text-muted-foreground hover:text-primary transition-colors">
              Privacidade
            </Link>
            <Link href="/legal/refund" className="nex-mono text-[10px] text-muted-foreground hover:text-primary transition-colors">
              Reembolso
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
