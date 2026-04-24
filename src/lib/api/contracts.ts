/**
 * Atlas Global Payments — TypeScript Contracts V1.01 (NeXFlowX Engine)
 * BaaS (Banking as a Service) — Settlement Engine
 */

export type UserRole = 'admin' | 'merchant' | 'customer';
export type WalletType = 'merchant' | 'treasury' | 'fee' | 'fx_pool';
export type LedgerEntryType = 'PAYIN' | 'SWAP' | 'PAYOUT' | 'FEE' | 'REFUND';
export type LedgerEntryStatus = 'pending' | 'cleared' | 'failed';
export type LedgerDirection = 'CREDIT' | 'DEBIT';
export type PayoutMethod = 'IBAN' | 'CRYPTO' | 'PIX' | 'SEPA' | 'BANK';
export type ActionTicketStatus = 'pending_review' | 'approved' | 'rejected' | 'processing';
export type NumericOrString = number | string;

function safeNum(val: unknown): number {
  const n = Number(val);
  return isFinite(n) ? n : 0;
}

export function mapWallet(raw: Record<string, unknown>): Wallet {
  return {
    id: String(raw.id ?? ''),
    currency_code: String(raw.currency_code ?? raw.currency ?? 'EUR'),
    type: (String(raw.type ?? 'merchant')) as WalletType,
    balance_incoming: safeNum(raw.balance_incoming),
    balance_pending: safeNum(raw.balance_pending),
    balance_available: safeNum(raw.balance_available),
    balance_total: safeNum(raw.balance_total) || (safeNum(raw.balance_incoming) + safeNum(raw.balance_pending) + safeNum(raw.balance_available)),
  };
}

export function mapLedgerEntry(raw: Record<string, unknown>): LedgerEntry {
  return {
    id: String(raw.id ?? ''),
    type: (String(raw.type ?? 'PAYIN')) as LedgerEntryType,
    status: (String(raw.status ?? 'pending')) as LedgerEntryStatus,
    direction: String(raw.direction ?? 'CREDIT') as LedgerDirection,
    amount: safeNum(raw.amount),
    currency: String(raw.currency ?? 'EUR'),
    description: raw.description ? String(raw.description) : undefined,
    reference: raw.reference ? String(raw.reference) : undefined,
    created_at: String(raw.created_at ?? new Date().toISOString()),
    clears_at: raw.clears_at ? String(raw.clears_at) : undefined,
  };
}

export function mapStore(raw: Record<string, unknown>): Store {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    store_id: String(raw.store_id ?? raw.id ?? ''),
    status: String(raw.status ?? 'active'),
    created_at: String(raw.created_at ?? new Date().toISOString()),
  };
}

export function mapGateway(raw: Record<string, unknown>): Gateway {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    type: String(raw.type ?? 'unknown'),
    is_active: Boolean(raw.is_active ?? raw.active ?? true),
    created_at: String(raw.created_at ?? new Date().toISOString()),
  };
}

export function mapPaymentLink(raw: Record<string, unknown>): PaymentLink {
  return {
    id: String(raw.id ?? ''),
    amount: safeNum(raw.amount),
    currency: String(raw.currency ?? 'EUR'),
    status: String(raw.status ?? 'active'),
    shareable_url: raw.shareable_url ? String(raw.shareable_url) : undefined,
    store_name: raw.store_name ? String(raw.store_name) : undefined,
    customer_email: raw.customer_email ? String(raw.customer_email) : undefined,
    created_at: String(raw.created_at ?? new Date().toISOString()),
    expires_at: raw.expires_at ? String(raw.expires_at) : undefined,
  };
}

export function mapActionTicket(raw: Record<string, unknown>): ActionTicket {
  return {
    id: String(raw.id ?? ''),
    type: raw.type ? String(raw.type) : undefined,
    priority: raw.priority ? String(raw.priority) : undefined,
    merchant: raw.merchant
      ? { username: String((raw.merchant as Record<string, unknown>)?.username ?? '') }
      : undefined,
    metadata: raw.metadata as Record<string, unknown> | undefined,
    status: (String(raw.status ?? 'pending_review')) as ActionTicketStatus,
    created_at: String(raw.created_at ?? new Date().toISOString()),
  };
}

/* ─── Auth ─── */
export interface LoginRequest { username: string; password: string; }
export interface LoginResponse { token: string; user: AuthUser; }
export interface AuthUser {
  id: string; username: string; email: string; role: UserRole;
  organization_id: string; created_at: string; last_login: string | null;
}
export interface AuthMeResponse { success: boolean; user: AuthUser; }

/* ─── Wallets (3-Stage Settlement) ─── */
export interface Wallet {
  id: string;
  currency_code: string;
  type: WalletType;
  balance_incoming: number;
  balance_pending: number;
  balance_available: number;
  balance_total: number;
}
export interface WalletsResponse { data: Wallet[]; }

/* ─── Swap ─── */
export interface SwapRequest { amount: NumericOrString; from_currency: string; to_currency: string; }
export interface SwapResponse { success: boolean; converted: number; fee: number; rate?: number; }

/* ─── Payout ─── */
export interface PayoutRequest { amount: NumericOrString; currency: string; method: PayoutMethod; destination: string; }
export interface PayoutResponse { success: boolean; message: string; }

/* ─── Deposits ─── */
export interface DepositRequest { amount: NumericOrString; currency: string; store_id?: string; customer_email?: string; }
export interface DepositResponse { success: boolean; data: { id: string; shareable_url: string; status: string }; }

/* ─── Stores (Multi-Tenant) ─── */
export interface Store {
  id: string; name: string; store_id: string; status: string; created_at: string;
}
export interface StoresResponse { data: Store[]; }

/* ─── Gateways ─── */
export interface Gateway {
  id: string; name: string; type: string; is_active: boolean; created_at: string;
}
export interface GatewaysResponse { data: Gateway[]; }

/* ─── Payment Links ─── */
export interface PaymentLink {
  id: string;
  amount: number;
  currency: string;
  status: string;
  shareable_url?: string;
  store_name?: string;
  customer_email?: string;
  created_at: string;
  expires_at?: string;
}
export interface PaymentLinksResponse { data: PaymentLink[]; }
export interface CreatePaymentLinkRequest {
  amount: NumericOrString;
  currency: string;
  store_id?: string;
  customer_email?: string;
}
export interface CreatePaymentLinkResponse {
  success: boolean;
  data: { id: string; shareable_url: string; status: string };
}

/* ─── Ledger ─── */
export interface LedgerEntry {
  id: string; type: LedgerEntryType; status: LedgerEntryStatus; direction: LedgerDirection;
  amount: number; currency: string; description?: string; reference?: string;
  created_at: string; clears_at?: string;
}
export interface LedgerResponse {
  data: LedgerEntry[];
  pagination?: { page: number; limit: number; total: number; total_pages: number; };
}

/* ─── Action Tickets ─── */
export interface ActionTicket {
  id: string; type?: string; priority?: string;
  merchant?: { username: string }; metadata?: Record<string, unknown>;
  status: ActionTicketStatus; created_at: string;
}
export interface ActionTicketsResponse { data: ActionTicket[]; }
export interface ApproveTicketResponse { success: boolean; message: string; }

/* ─── Settings ─── */
export interface ChangePasswordRequest { current_password: string; new_password: string; }
export interface ChangePasswordResponse { success: boolean; message: string; }
export interface UpdateEmailRequest { email: string; }
export interface UpdateEmailResponse { success: boolean; message: string; }
export interface UpdateNotificationsRequest {
  email_notifications?: boolean; transaction_alerts?: boolean;
  weekly_reports?: boolean; security_alerts?: boolean;
}

/* ─── API Keys ─── */
export interface ApiKey {
  id: string; key_hash: string; label?: string;
  created_at: string; last_used_at?: string; is_active: boolean;
}
export interface ApiKeysResponse { data: ApiKey[]; }
export interface CreateApiKeyResponse {
  data: { key: string; key_hash: string; label?: string; created_at: string; };
}

/* ─── User ─── */
export interface UserMeResponse {
  data: {
    id: string; username: string; email: string; role: UserRole;
    organization_id: string; webhook_url?: string; hmac_secret?: string; created_at: string;
  };
}
export interface UpdateUserMeRequest {
  email?: string; webhook_url?: string;
  email_notifications?: boolean; transaction_alerts?: boolean;
  weekly_reports?: boolean; security_alerts?: boolean;
}
export interface UpdateUserMeResponse { success: boolean; message: string; }

/* ─── Error ─── */
export interface APIError {
  error?: { code: string; message: string; details?: Record<string, unknown>; };
  message?: string;
}
