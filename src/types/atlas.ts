/**
 * Atlas Core Banking — TypeScript Types V3.0
 * Tipados rigorosamente a partir do Prisma Schema do Backend.
 * Fonte da Verdade: Atlas Core Banking Engine (Node.js + Prisma + PostgreSQL)
 */

/* ═══════════════════════════════════════════════════════════
   ENUMS — Pure TypeScript union types (no runtime values)

   Using plain union types instead of `const` objects avoids
   Vercel Turbopack SSR tree-shaking collisions where
   `export const X` + `export type X` with the same name
   caused ReferenceError at module evaluation.
   ═══════════════════════════════════════════════════════════ */

/** Papéis dentro de uma Organização */
export type OrgRole = 'ADMIN' | 'OPERATOR' | 'ACCOUNT_MANAGER';

/** Níveis KYC Progressivos — Define limites e taxas */
export type TierLevel = 'TIER_0_UNVERIFIED' | 'TIER_1_BASIC' | 'TIER_2_VERIFIED' | 'TIER_3_CORPORATE';

/** Estado da Conta do Utilizador */
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';

/** Moedas Suportadas */
export type Currency = 'EUR' | 'BRL' | 'USDT' | 'USD';

/** Tipos de Transação (Ledger) */
export type TransactionType = 'PROXY_INCOMING' | 'SETTLEMENT' | 'PAYOUT' | 'SWAP' | 'TRANSFER' | 'FEE';

/** Estado de uma Transação */
export type TransactionStatus = 'INCOMING' | 'PENDING' | 'COMPLETED' | 'BLOCKED' | 'FAILED';

/** Tipos de Ticket de Operação */
export type TicketType = 'MANUAL_WITHDRAWAL' | 'TIER_UPGRADE' | 'FEE_ADJUSTMENT' | 'SUPPORT';

/** Estado de um Ticket */
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

/** Papel principal do utilizador no sistema (para UI routing) */
export type AtlasRole = 'customer' | 'merchant' | 'admin';

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
