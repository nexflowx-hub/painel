/**
 * Atlas Core — RBAC (Role-Based Access Control) Matrix
 * 
 * Define permissões granulares por role:
 * - customer: Acesso básico a wallets, transações, depósitos
 * - merchant: Tudo do customer + links de pagamento, API keys, checkouts
 * - admin: Tudo + gestão de tickets, KYC, fee schedules, operadores
 */

import type { AtlasRole } from '@/types/atlas';

/** Secções de navegação do dashboard */
export type DashboardSection =
  // Customer
  | 'dashboard'
  | 'wallets'
  | 'activity'
  | 'swap'
  | 'payouts'
  | 'deposits'
  | 'kyc'
  // Merchant
  | 'checkout'
  | 'gateways'
  | 'developer'
  // Admin / Operator
  | 'approvals'
  | 'liquidity'
  | 'fee-schedule'
  | 'users'
  // System
  | 'settings';

/** Permissões por secção */
export interface SectionPermission {
  id: DashboardSection;
  label: string;
  labelKey: string;         // i18n key
  minRole: AtlasRole;
  category: 'operation' | 'merchant' | 'administration' | 'system';
  icon?: string;             // Lucide icon name
}

/** Matriz de permissões completa */
export const RBAC_MATRIX: SectionPermission[] = [
  // ═══ OPERAÇÃO (Customer+) ═══
  { id: 'dashboard', label: 'Dashboard', labelKey: 'nav.dashboard', minRole: 'customer', category: 'operation', icon: 'LayoutDashboard' },
  { id: 'wallets', label: 'Tesouraria', labelKey: 'nav.wallets', minRole: 'customer', category: 'operation', icon: 'Landmark' },
  { id: 'activity', label: 'Transações', labelKey: 'nav.activity', minRole: 'customer', category: 'operation', icon: 'ReceiptText' },
  { id: 'swap', label: 'Converter Moeda', labelKey: 'nav.swap', minRole: 'customer', category: 'operation', icon: 'ArrowLeftRight' },
  { id: 'payouts', label: 'Levantamentos', labelKey: 'nav.payouts', minRole: 'customer', category: 'operation', icon: 'Banknote' },
  { id: 'deposits', label: 'Depósitos', labelKey: 'nav.deposits', minRole: 'customer', category: 'operation', icon: 'Download' },
  { id: 'kyc', label: 'Verificação KYC', labelKey: 'nav.kyc', minRole: 'customer', category: 'operation', icon: 'ShieldCheck' },

  // ═══ MERCHANT (Merchant+) ═══
  { id: 'checkout', label: 'Checkout & Lojas', labelKey: 'nav.checkout', minRole: 'merchant', category: 'merchant', icon: 'ShoppingCart' },
  { id: 'gateways', label: 'Gateways & API', labelKey: 'nav.gateways', minRole: 'merchant', category: 'merchant', icon: 'Plug' },
  { id: 'developer', label: 'Developer / API', labelKey: 'nav.developer', minRole: 'merchant', category: 'merchant', icon: 'Code2' },

  // ═══ ADMINISTRAÇÃO (Admin only) ═══
  { id: 'approvals', label: 'Operation Tickets', labelKey: 'nav.approvals', minRole: 'admin', category: 'administration', icon: 'ClipboardList' },
  { id: 'liquidity', label: 'Liquidez do Sistema', labelKey: 'nav.liquidity', minRole: 'admin', category: 'administration', icon: 'Droplets' },
  { id: 'fee-schedule', label: 'Motor de Taxas', labelKey: 'nav.feeSchedule', minRole: 'admin', category: 'administration', icon: 'Percent' },
  { id: 'users', label: 'Utilizadores', labelKey: 'nav.users', minRole: 'admin', category: 'administration', icon: 'Users' },

  // ═══ SISTEMA (todos) ═══
  { id: 'settings', label: 'Definições', labelKey: 'nav.settings', minRole: 'customer', category: 'system', icon: 'Settings' },
];

/** Hierarquia de roles (para comparação) */
const ROLE_HIERARCHY: Record<AtlasRole, number> = {
  customer: 1,
  merchant: 2,
  admin: 3,
};

/** Verifica se uma role tem acesso a uma secção */
export function hasAccess(role: AtlasRole, sectionId: DashboardSection): boolean {
  const section = RBAC_MATRIX.find((s) => s.id === sectionId);
  if (!section) return false;
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[section.minRole];
}

/** Filtra secções visíveis por role */
export function getVisibleSections(role: AtlasRole): SectionPermission[] {
  return RBAC_MATRIX.filter((s) => hasAccess(role, s.id));
}

/** Filtra secções por categoria */
export function getSectionsByCategory(role: AtlasRole, category: SectionPermission['category']): SectionPermission[] {
  return getVisibleSections(role).filter((s) => s.category === category);
}

/** Obtém a secção default (primeira visível) */
export function getDefaultSection(role: AtlasRole): DashboardSection {
  const visible = getVisibleSections(role);
  return visible.length > 0 ? visible[0].id : 'dashboard';
}

/** Labels de role para exibição */
export const ROLE_CONFIG: Record<AtlasRole, { label: string; color: string; badgeClass: string; description: string }> = {
  customer: {
    label: 'CUSTOMER',
    color: '#A855F7',
    badgeClass: 'neon-badge-purple',
    description: 'Utilizador final — Wallets, Transações, Depósitos',
  },
  merchant: {
    label: 'MERCHANT',
    color: '#00B4D8',
    badgeClass: 'neon-badge-cyan',
    description: 'Vendedor — Links de Pagamento, API, Checkouts',
  },
  admin: {
    label: 'ADMIN',
    color: '#FFB800',
    badgeClass: 'neon-badge-amber',
    description: 'Operador — Tickets, KYC, Fee Schedule, Liquidez',
  },
};

/** Labels de Tier KYC */
export const TIER_CONFIG: Record<string, { label: string; color: string; badgeClass: string; tierNum: number }> = {
  TIER_0_UNVERIFIED: { label: 'KYC-0', color: '#666', badgeClass: 'neon-badge', tierNum: 0 },
  TIER_1_BASIC: { label: 'KYC-1', color: '#00D4AA', badgeClass: 'neon-badge-teal', tierNum: 1 },
  TIER_2_VERIFIED: { label: 'KYC-2', color: '#00B4D8', badgeClass: 'neon-badge-cyan', tierNum: 2 },
  TIER_3_CORPORATE: { label: 'KYC-3', color: '#FFB800', badgeClass: 'neon-badge-amber', tierNum: 3 },
};
