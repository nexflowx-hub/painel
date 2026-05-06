'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe, Check } from 'lucide-react'
import { useI18n, localeNames, type Locale } from '@/lib/i18n'

const locales: { code: Locale; name: string; flag: string }[] = [
  { code: 'pt', name: 'Português', flag: 'PT' },
  { code: 'en', name: 'English', flag: 'EN' },
  { code: 'es', name: 'Español', flag: 'ES' },
  { code: 'fr', name: 'Français', flag: 'FR' },
]

export function LanguageSelector() {
  const { locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLocale = locales.find(l => l.code === locale) || locales[0]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all hover:bg-accent"
        style={{ color: 'var(--muted-foreground)' }}
        aria-label="Selecionar idioma"
        title="Idioma"
      >
        <Globe className="w-4 h-4" />
        <span className="nex-mono text-[10px] font-semibold hidden sm:inline">
          {currentLocale.flag}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 py-1.5 rounded-lg shadow-xl z-50 min-w-[140px]"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          {locales.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLocale(l.code)
                setOpen(false)
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
              style={{ color: locale === l.code ? 'var(--primary)' : 'var(--foreground)' }}
            >
              <span className="nex-mono text-[10px] font-semibold w-5">{l.flag}</span>
              <span className="flex-1">{l.name}</span>
              {locale === l.code && (
                <Check className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
