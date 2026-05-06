/**
 * Atlas Core Banking — TypeScript Types V3.0
 * Tipados rigorosamente a partir do Prisma Schema do Backend.
 * Fonte da Verdade: Atlas Core Banking Engine (Node.js + Prisma + PostgreSQL)
 */

/* ═══════════════════════════════════════════════════════════
   ENUMS — Runtime-safe const objects + TypeScript types
   Exported as const objects to prevent Vercel Turbopack SSR
   ReferenceError when import type is not properly erased.
   ═══════════════════════════════════════════════════════════ */

/** Papéis dentro de uma Organização */
export const OrgRole = { ADMIN: 'ADMIN', OPERATOR: 'OPERATOR', ACCOUNT_MANAGER: 'ACCOUNT_MANAGER' } as const;
export type OrgRole = (typeof OrgRole)[keyof typeof OrgRole];

/** Níveis KYC Progressivos — Define limites e taxas */
export const TierLevel = { TIER_0_UNVERIFIED: 'TIER_0_UNVERIFIED', TIER_1_BASIC: 'TIER_1_BASIC', TIER_2_VERIFIED: 'TIER_2_VERIFIED', TIER_3_CORPORATE: 'TIER_3_CORPORATE' } as const;
export type TierLevel = (typeof TierLevel)[keyof typeof TierLevel];

/** Estado da Conta do Utilizador */
export const AccountStatus = { ACTIVE: 'ACTIVE', SUSPENDED: 'SUSPENDED', BLOCKED: 'BLOCKED' } as const;
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

/** Moedas Suportadas */
export const Currency = { EUR: 'EUR', BRL: 'BRL', USDT: 'USDT', USD: 'USD' } as const;
export type Currency = (typeof Currency)[keyof typeof Currency];

/** Tipos de Transação (Ledger) */
export const TransactionType = { PROXY_INCOMING: 'PROXY_INCOMING', SETTLEMENT: 'SETTLEMENT', PAYOUT: 'PAYOUT', SWAP: 'SWAP', TRANSFER: 'TRANSFER', FEE: 'FEE' } as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

/** Estado de uma Transação */
export const TransactionStatus = { INCOMING: 'INCOMING', PENDING: 'PENDING', COMPLETED: 'COMPLETED', BLOCKED: 'BLOCKED', FAILED: 'FAILED' } as const;
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

/** Tipos de Ticket de Operação */
export const TicketType = { MANUAL_WITHDRAWAL: 'MANUAL_WITHDRAWAL', TIER_UPGRADE: 'TIER_UPGRADE', FEE_ADJUSTMENT: 'FEE_ADJUSTMENT', SUPPORT: 'SUPPORT' } as const;
export type TicketType = (typeof TicketType)[keyof typeof TicketType];

/** Estado de um Ticket */
export const TicketStatus = { OPEN: 'OPEN', IN_PROGRESS: 'IN_PROGRESS', RESOLVED: 'RESOLVED', REJECTED: 'REJECTED' } as const;
export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

/** Papel principal do utilizador no sistema (para UI routing) */
export const AtlasRole = { customer: 'customer', merchant: 'merchant', admin: 'admin' } as const;
export type AtlasRole = (typeof AtlasRole)[keyof typeof AtlasRole];

/* ═══════════════════════════════════════════════════════════
   MODELS — Espelho dos modelos Prisma (campos de saída)
   ═══════════════════════════════════════════════════════════ */

/** 🏢 Organização */
export interface Organization {
  id: string;
  name: string;
  apiKey?: string;
  createdAt: string;
  // Populated counts (optional, from API)
  _count?: {
    users: number;
    operators: number;
    tickets: number;
  };
}

/** 👤 Operador de uma Organização */
export interface OrgOperator {
  id: string;
  organizationId: string;
  organization?: Organization;
  email: string;
  role: OrgRole;
  createdAt: string;
}

/** 👤 Utilizador (Seller / Cliente) */
export interface User {
  id: string;
  organizationId?: string;
  organization?: Organization;
  nickname?: string;
  email?: string;
  phone?: string;
  telegramId?: string;
  fullName?: string;
  tier: TierLevel;
  status: AccountStatus;
  requiresPasswordChange: boolean;
  createdAt: string;
  updatedAt: string;
  // Joined data (optional)
  wallets?: Wallet[];
  _walletCount?: number;
  _transactionCount?: number;
}

/** 💼 Carteira Multi-Moeda — 4 Saldos */
export interface Wallet {
  id: string;
  walletReference: string;
  userId: string;
  currency: Currency;
  blockchainAddress?: string;
  turnkeyWalletId?: string;
  balanceIncoming: number;
  balancePending: number;
  balanceAvailable: number;
  balanceBlocked: number;
  createdAt: string;
  updatedAt: string;
}

/** Computed balance totals for a wallet */
export interface WalletSummary {
  currency: Currency;
  incoming: number;
  pending: number;
  available: number;
  blocked: number;
  total: number;
}

/** 📈 FeeSchedule */
export interface FeeSchedule {
  id: string;
  tier: TierLevel;
  transactionType: TransactionType;
  currency?: Currency;
  percentageFee: number;
  fixedFee: number;
  isManualOverride: boolean;
}

/** 🧾 Transação (Ledger Entry) */
export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  feeApplied: number;
  currency: Currency;
  proxyReference?: string;
  onrampReference?: string;
  description?: string;
  batchId?: string;
  batch?: SettlementBatch;
  createdAt: string;
  updatedAt: string;
}

/** 📦 Settlement Batch */
export interface SettlementBatch {
  id: string;
  batchNumber: string;
  processedAt: string;
  totalAmount: number;
  currency: Currency;
  _transactionCount?: number;
}

/** 🎫 Operation Ticket */
export interface OperationTicket {
  id: string;
  organizationId: string;
  organization?: Organization;
  creatorId: string;
  creator?: OrgOperator;
  targetUserId?: string;
  targetUser?: User;
  type: TicketType;
  status: TicketStatus;
  description: string;
  resolutionNotes?: string;
  resolvedById?: string;
  createdAt: string;
  updatedAt: string;
}

/* ═══════════════════════════════════════════════════════════
   AUTH — JWT Payload & Login
   ═══════════════════════════════════════════════════════════ */

/** Payload decodificado do JWT */
export interface AtlasJWTPayload {
  sub: string;         // userId ou operatorId
  email: string;
  role: AtlasRole;
  tier?: TierLevel;
  organizationId?: string;
  organizationName?: string;
  iat: number;
  exp: number;
}

/** Request de Login */
export interface LoginRequest {
  identifier: string;  // Atlas ID, email ou phone
  password: string;
}

/** Response de Login */
export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: AuthenticatedUser;
}

/** Utilizador retornado no login/session */
export interface AuthenticatedUser {
  id: string;
  email?: string;
  nickname?: string;
  fullName?: string;
  role: AtlasRole;
  tier: TierLevel;
  status: AccountStatus;
  organizationId?: string;
  organizationName?: string;
  avatar?: string;
}

/* ═══════════════════════════════════════════════════════════
   KYC — Progressivo
   ═══════════════════════════════════════════════════════════ */

/** Metadados do KYC para exibição na UI */
export interface KYCLevel {
  tier: TierLevel;
  label: string;
  description: string;
  requirements: string[];
  limits: KYCLimits;
  isCompleted: boolean;
}

/** Limites por nível KYC */
export interface KYCLimits {
  maxTransactionAmount: Record<Currency, number>;
  maxMonthlyVolume: Record<Currency, number>;
  dailyPayoutLimit: Record<Currency, number>;
}

/** Request — KYC Tier 1 (Registo Inicial) */
export interface KYCTier1Request {
  fullName: string;
  nickname: string;
  region: 'EUROPE' | 'BRAZIL' | 'OTHER';
  contactMethod: 'EMAIL' | 'WHATSAPP' | 'TELEGRAM';
  contactValue: string;
}

/** Request — KYC Tier 2 (Declarativo) */
export interface KYCTier2Request {
  taxId: string;          // CPF, NIF, TIN
  dateOfBirth: string;    // ISO date
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

/* ═══════════════════════════════════════════════════════════
   FLUXOS CORE — IN (Depositar), SWAP, OUT (Levantar)
   ═══════════════════════════════════════════════════════════ */

/** Rota de depósito retornada pela API */
export interface DepositRoute {
  provider: string;        // 'misticpay' | 'stripe' | 'onramp' | etc
  providerName: string;    // 'MisticPay PIX' | 'Stripe Card' etc
  method: string;          // 'PIX' | 'CARD' | 'BANK_TRANSFER'
  currency: Currency;
  estimatedFee: number;
  estimatedArrival: string;
  // Provider-specific payload
  payload: DepositRoutePayload;
}

/** Payload dinâmico por provider */
export interface DepositRoutePayload {
  pixCode?: string;
  pixImageBase64?: string;
  stripeClientSecret?: string;
  redirectUrl?: string;
  bankDetails?: {
    iban: string;
    bic: string;
    beneficiary: string;
    reference: string;
  };
  [key: string]: unknown;
}

/** Request — Iniciar Depósito */
export interface DepositRequest {
  currency: Currency;
  amount: number;
}

/** Response — Iniciar Depósito */
export interface DepositResponse {
  transactionId: string;
  status: TransactionStatus;
  routes: DepositRoute[];
}

/** Request — Executar Swap */
export interface SwapRequest {
  fromCurrency: Currency;
  toCurrency: Currency;
  amount: number;
}

/** Response — Swap executado */
export interface SwapResponse {
  success: boolean;
  transactionId: string;
  from: { currency: Currency; amount: number; };
  to: { currency: Currency; amount: number; };
  feeApplied: number;
  exchangeRate: number;
  estimatedSettlement: string;
}

/** Request — Solicitar Levantamento */
export interface PayoutRequest {
  currency: Currency;
  amount: number;
  method: 'IBAN' | 'PIX' | 'CRYPTO' | 'SEPA' | 'BANK';
  destination: string;     // IBAN, PIX key, Wallet address, etc
}

/** Response — Payout solicitado */
export interface PayoutResponse {
  success: boolean;
  transactionId: string;
  status: TransactionStatus;
  message: string;
  estimatedSettlement: string;
}

/* ═══════════════════════════════════════════════════════════
   MERCHANT — Stores, Payment Links, Gateways, Customers
   ═══════════════════════════════════════════════════════════ */

/** 🏪 Loja / Marca de um Merchant */
export interface Store {
  id: string;
  name: string;
  description?: string;
  store_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
}

/** 🏪 Loja com Checkout & Branding (E-commerce) */
export interface StoreCheckout {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color: string;
  require_document: boolean;
  require_phone: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
}

/** Configuração do Checkout (enviada ao backend) */
export interface StoreCheckoutConfig {
  name?: string;
  slug?: string;
  logo_url?: string;
  primary_color?: string;
  require_document?: boolean;
  require_phone?: boolean;
  success_url?: string;
}

/** 🔗 Link de Pagamento Inteligente */
export interface PaymentLink {
  id: string;
  amount: number;
  currency: string;
  status: 'active' | 'expired' | 'paid' | 'cancelled';
  shareable_url?: string;
  store_name?: string;
  customer_email?: string;
  store_id?: string;
  created_at: string;
  expires_at?: string;
}

/** 🔗 Smart Payment Link (com campos de produto) */
export interface SmartPaymentLink {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: Currency;
  status: 'active' | 'expired' | 'paid' | 'cancelled';
  is_single_use: boolean;
  sales_count: number;
  shareable_url?: string;
  success_url?: string;
  store_id?: string;
  store_slug?: string;
  created_at: string;
  expires_at?: string;
}

/** 👤 Cliente do Mini-CRM (pagador) */
export interface CheckoutCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  document?: string;
  document_type?: 'CPF' | 'NIF' | 'CNPJ' | 'PASSPORT';
  total_spent: number;
  total_spent_currency: string;
  transactions_count: number;
  last_purchase_at: string;
  created_at: string;
}

/** 🔌 Gateway de Pagamento */
export interface Gateway {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  created_at: string;
  config?: Record<string, unknown>;
}

/* ═══════════════════════════════════════════════════════════
   PAGINACAO & FILTRAGEM
   ═══════════════════════════════════════════════════════════ */

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  currency?: Currency;
  walletId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

/* ═══════════════════════════════════════════════════════════
   API ERROR
   ═══════════════════════════════════════════════════════════ */

export interface AtlasAPIError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
