'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type Locale = 'pt' | 'en' | 'es' | 'fr'

export const localeNames: Record<Locale, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
  fr: 'Français',
}

export const localeFlags: Record<Locale, string> = {
  pt: '🇵🇹',
  en: '🇬🇧',
  es: '🇪🇸',
  fr: '🇫🇷',
}

// Translation dictionary
const translations: Record<Locale, Record<string, string>> = {
  pt: {
    // Header
    'header.search': 'Pesquisar transações, wallets...',
    'header.notifications': 'Notificações',
    'header.live': 'LIVE',
    
    // Navigation
    'nav.operation': 'Operação',
    'nav.administration': 'Administração',
    'nav.system': 'Sistema',
    'nav.dashboard': 'Dashboard',
    'nav.wallets': 'Tesouraria / Wallets',
    'nav.activity': 'Transações',
    'nav.stores': 'Lojas & Marcas',
    'nav.checkout': 'Checkout & Lojas',
    'nav.payment-links': 'Links de Pagamento',
    'nav.gateways': 'Gateways & API',
    'nav.approvals': 'Aprovações',
    'nav.liquidity': 'Liquidez do Sistema',
    'nav.developer': 'Developer / API',
    'nav.settings': 'Definições',
    'nav.collapse': 'Recolher',
    
    // Login
    'login.title': 'Autenticação de Acesso',
    'login.register': 'Criar Nova Conta',
    'login.email': 'Email',
    'login.password': 'Palavra-passe',
    'login.confirmPassword': 'Confirmar Palavra-passe',
    'login.submit': 'Entrar na Plataforma',
    'login.registerSubmit': 'Criar Conta',
    'login.loading': 'A autenticar...',
    'login.registerLoading': 'A criar conta...',
    'login.secure': 'Ligação encriptada TLS 1.3 · AES-256-GCM',
    'login.passwordMin': 'A palavra-passe deve ter pelo menos 8 caracteres.',
    'login.passwordMismatch': 'As palavras-passe não coincidem.',
    
    // Footer
    'footer.legalSupport': 'Sustentação Legal',
    'footer.ecosystem': 'Ecossistema NeX',
    'footer.transparency': 'Transparência',
    'footer.holding': 'Holding (Proprietária)',
    'footer.infrastructure': 'Infraestrutura & Sistemas',
    'footer.operations': 'Operações & Suporte',
    'footer.termsConditions': 'Terms & Conditions',
    'footer.complianceManifesto': 'Compliance Manifesto · IP & Licenciamento',
    'footer.dataPolicy': 'Política de Dados · Security Standards',
    'footer.nonCustodial': 'Non-Custodial Orchestration · AES-256-GCM',
    'footer.logout': 'Sair',
    'footer.termsService': 'Termos de Serviço',
    'footer.privacyPolicy': 'Política de Privacidade',
    'footer.refundPolicy': 'Política de Reembolso',
    'footer.delivery': 'Entregas',
    'footer.paymentMethods': 'Métodos Aceites',
    'footer.contact': 'Contactos',
    
    // Chat
    'chat.title': 'Assistente Atlas',
    'chat.placeholder': 'Escreva a sua mensagem...',
    'chat.welcome': 'Olá! Como posso ajudar hoje?',
    'chat.send': 'Enviar',
    
    // Common
    'common.loading': 'A carregar...',
    'common.validating': 'A validar sessão...',
  },
  en: {
    // Header
    'header.search': 'Search transactions, wallets...',
    'header.notifications': 'Notifications',
    'header.live': 'LIVE',
    
    // Navigation
    'nav.operation': 'Operation',
    'nav.administration': 'Administration',
    'nav.system': 'System',
    'nav.dashboard': 'Dashboard',
    'nav.wallets': 'Treasury / Wallets',
    'nav.activity': 'Transactions',
    'nav.stores': 'Stores & Brands',
    'nav.checkout': 'Checkout & Stores',
    'nav.payment-links': 'Payment Links',
    'nav.gateways': 'Gateways & API',
    'nav.approvals': 'Approvals',
    'nav.liquidity': 'System Liquidity',
    'nav.developer': 'Developer / API',
    'nav.settings': 'Settings',
    'nav.collapse': 'Collapse',
    
    // Login
    'login.title': 'Access Authentication',
    'login.register': 'Create New Account',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.confirmPassword': 'Confirm Password',
    'login.submit': 'Enter Platform',
    'login.registerSubmit': 'Create Account',
    'login.loading': 'Authenticating...',
    'login.registerLoading': 'Creating account...',
    'login.secure': 'Encrypted connection TLS 1.3 · AES-256-GCM',
    'login.passwordMin': 'Password must be at least 8 characters.',
    'login.passwordMismatch': 'Passwords do not match.',
    
    // Footer
    'footer.legalSupport': 'Legal Support',
    'footer.ecosystem': 'NeX Ecosystem',
    'footer.transparency': 'Transparency',
    'footer.holding': 'Holding (Owner)',
    'footer.infrastructure': 'Infrastructure & Systems',
    'footer.operations': 'Operations & Support',
    'footer.termsConditions': 'Terms & Conditions',
    'footer.complianceManifesto': 'Compliance Manifesto · IP & Licensing',
    'footer.dataPolicy': 'Data Policy · Security Standards',
    'footer.nonCustodial': 'Non-Custodial Orchestration · AES-256-GCM',
    'footer.logout': 'Logout',
    'footer.termsService': 'Terms of Service',
    'footer.privacyPolicy': 'Privacy Policy',
    'footer.refundPolicy': 'Refund Policy',
    'footer.delivery': 'Delivery',
    'footer.paymentMethods': 'Accepted Methods',
    'footer.contact': 'Contact',
    
    // Chat
    'chat.title': 'Atlas Assistant',
    'chat.placeholder': 'Type your message...',
    'chat.welcome': 'Hello! How can I help you today?',
    'chat.send': 'Send',
    
    // Common
    'common.loading': 'Loading...',
    'common.validating': 'Validating session...',
  },
  es: {
    // Header
    'header.search': 'Buscar transacciones, wallets...',
    'header.notifications': 'Notificaciones',
    'header.live': 'EN VIVO',
    
    // Navigation
    'nav.operation': 'Operación',
    'nav.administration': 'Administración',
    'nav.system': 'Sistema',
    'nav.dashboard': 'Dashboard',
    'nav.wallets': 'Tesorería / Wallets',
    'nav.activity': 'Transacciones',
    'nav.stores': 'Tiendas & Marcas',
    'nav.checkout': 'Checkout & Tiendas',
    'nav.payment-links': 'Enlaces de Pago',
    'nav.gateways': 'Gateways & API',
    'nav.approvals': 'Aprobaciones',
    'nav.liquidity': 'Liquidez del Sistema',
    'nav.developer': 'Developer / API',
    'nav.settings': 'Configuración',
    'nav.collapse': 'Contraer',
    
    // Login
    'login.title': 'Autenticación de Acceso',
    'login.register': 'Crear Nueva Cuenta',
    'login.email': 'Email',
    'login.password': 'Contraseña',
    'login.confirmPassword': 'Confirmar Contraseña',
    'login.submit': 'Entrar a la Plataforma',
    'login.registerSubmit': 'Crear Cuenta',
    'login.loading': 'Autenticando...',
    'login.registerLoading': 'Creando cuenta...',
    'login.secure': 'Conexión cifrada TLS 1.3 · AES-256-GCM',
    'login.passwordMin': 'La contraseña debe tener al menos 8 caracteres.',
    'login.passwordMismatch': 'Las contraseñas no coinciden.',
    
    // Footer
    'footer.legalSupport': 'Soporte Legal',
    'footer.ecosystem': 'Ecosistema NeX',
    'footer.transparency': 'Transparencia',
    'footer.holding': 'Holding (Propietaria)',
    'footer.infrastructure': 'Infraestructura & Sistemas',
    'footer.operations': 'Operaciones & Soporte',
    'footer.termsConditions': 'Términos & Condiciones',
    'footer.complianceManifesto': 'Manifiesto de Cumplimiento · IP & Licencias',
    'footer.dataPolicy': 'Política de Datos · Estándares de Seguridad',
    'footer.nonCustodial': 'Orquestación No Custodial · AES-256-GCM',
    'footer.logout': 'Salir',
    'footer.termsService': 'Términos de Servicio',
    'footer.privacyPolicy': 'Política de Privacidad',
    'footer.refundPolicy': 'Política de Reembolso',
    'footer.delivery': 'Entregas',
    'footer.paymentMethods': 'Métodos Aceptados',
    'footer.contact': 'Contacto',
    
    // Chat
    'chat.title': 'Asistente Atlas',
    'chat.placeholder': 'Escribe tu mensaje...',
    'chat.welcome': '¡Hola! ¿Cómo puedo ayudarte hoy?',
    'chat.send': 'Enviar',
    
    // Common
    'common.loading': 'Cargando...',
    'common.validating': 'Validando sesión...',
  },
  fr: {
    // Header
    'header.search': 'Rechercher transactions, wallets...',
    'header.notifications': 'Notifications',
    'header.live': 'EN DIRECT',
    
    // Navigation
    'nav.operation': 'Opération',
    'nav.administration': 'Administration',
    'nav.system': 'Système',
    'nav.dashboard': 'Dashboard',
    'nav.wallets': 'Trésorerie / Wallets',
    'nav.activity': 'Transactions',
    'nav.stores': 'Boutiques & Marques',
    'nav.checkout': 'Checkout & Boutiques',
    'nav.payment-links': 'Liens de Paiement',
    'nav.gateways': 'Gateways & API',
    'nav.approvals': 'Approbations',
    'nav.liquidity': 'Liquidité du Système',
    'nav.developer': 'Developer / API',
    'nav.settings': 'Paramètres',
    'nav.collapse': 'Réduire',
    
    // Login
    'login.title': 'Authentification d\'Accès',
    'login.register': 'Créer un Nouveau Compte',
    'login.email': 'Email',
    'login.password': 'Mot de passe',
    'login.confirmPassword': 'Confirmer le Mot de passe',
    'login.submit': 'Accéder à la Plateforme',
    'login.registerSubmit': 'Créer un Compte',
    'login.loading': 'Authentification...',
    'login.registerLoading': 'Création du compte...',
    'login.secure': 'Connexion chiffrée TLS 1.3 · AES-256-GCM',
    'login.passwordMin': 'Le mot de passe doit comporter au moins 8 caractères.',
    'login.passwordMismatch': 'Les mots de passe ne correspondent pas.',
    
    // Footer
    'footer.legalSupport': 'Support Juridique',
    'footer.ecosystem': 'Écosystème NeX',
    'footer.transparency': 'Transparence',
    'footer.holding': 'Holding (Propriétaire)',
    'footer.infrastructure': 'Infrastructure & Systèmes',
    'footer.operations': 'Opérations & Support',
    'footer.termsConditions': 'Termes & Conditions',
    'footer.complianceManifesto': 'Manifeste de Conformité · PI & Licences',
    'footer.dataPolicy': 'Politique des Données · Standards de Sécurité',
    'footer.nonCustodial': 'Orchestration Non-Dépositaire · AES-256-GCM',
    'footer.logout': 'Déconnexion',
    'footer.termsService': 'Conditions d\'Utilisation',
    'footer.privacyPolicy': 'Politique de Confidentialité',
    'footer.refundPolicy': 'Politique de Remboursement',
    'footer.delivery': 'Livraisons',
    'footer.paymentMethods': 'Méthodes Acceptées',
    'footer.contact': 'Contact',
    
    // Chat
    'chat.title': 'Assistant Atlas',
    'chat.placeholder': 'Écrivez votre message...',
    'chat.welcome': 'Bonjour! Comment puis-je vous aider aujourd\'hui?',
    'chat.send': 'Envoyer',
    
    // Common
    'common.loading': 'Chargement...',
    'common.validating': 'Validation de la session...',
  },
}

// Detect browser language
function detectBrowserLanguage(): Locale {
  if (typeof window === 'undefined') return 'pt'
  
  const browserLang = navigator.language.toLowerCase().split('-')[0]
  
  if (browserLang === 'pt') return 'pt'
  if (browserLang === 'en') return 'en'
  if (browserLang === 'es') return 'es'
  if (browserLang === 'fr') return 'fr'
  
  return 'pt' // Default
}

// Context
interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check localStorage first, then browser language
    const saved = localStorage.getItem('atlas-locale') as Locale | null
    const detected = saved || detectBrowserLanguage()
    setLocaleState(detected)
    setMounted(true)
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('atlas-locale', newLocale)
  }

  const t = (key: string): string => {
    return translations[locale]?.[key] || translations.pt[key] || key
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    // Return default values if not wrapped in provider
    return {
      locale: 'pt' as Locale,
      setLocale: () => {},
      t: (key: string) => translations.pt[key] || key,
    }
  }
  return context
}
