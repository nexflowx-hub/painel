/**
 * Atlas Core Banking — API Client V4.0 (Production)
 * 
 * - Usa fetch nativo (sem axios, sem SDKs externos)
 * - JWT automaticamente injetado via interceptor
 * - Tipagem forte com TypeScript generics
 * - Base URL: process.env.NEXT_PUBLIC_API_URL (termina em /api/v1)
 * - Sem dados mock — todas as chamadas vão para o backend real
 */

import type {
  AtlasAPIError as AtlasAPIErrorType,
  LoginRequest,
  LoginResponse,
  AuthenticatedUser,
  Wallet,
  WalletSummary,
  Transaction,
  PaginatedResponse,
  TransactionFilters,
  DepositRequest,
  DepositResponse,
  SwapRequest,
  SwapResponse,
  PayoutRequest,
  PayoutResponse,
  OperationTicket,
  Organization,
  FeeSchedule,
  KYCTier1Request,
  KYCTier2Request,
  User,
  Currency,
  TierLevel,
  TicketStatus,
  StoreCheckout,
  StoreCheckoutConfig,
  SmartPaymentLink,
  CheckoutCustomer,
} from '@/types/atlas';

/* ═══════════════════════════════════════════════════════════
   MERCHANT API KEY TYPES
   ═══════════════════════════════════════════════════════════ */

/** Response from GET /merchant/api-keys */
export interface MerchantApiKeyResponse {
  apiKey: string;       // 'sk_live_atlas_...'
  storeName?: string;
}

/* ═══════════════════════════════════════════════════════════
   PUBLIC RATE TYPES
   ═══════════════════════════════════════════════════════════ */

export interface ExchangeRate {
  base: string;
  currency: string;
  rate: number;
  timestamp: string;
}

/* ═══════════════════════════════════════════════════════════
   CONFIGURAÇÃO
   ═══════════════════════════════════════════════════════════ */

/**
 * Base URL da API Atlas Core.
 * Variável de ambiente: NEXT_PUBLIC_API_URL
 * Valor esperado: https://api.atlasglobal.digital/api/v1
 * Nunca usar localhost hardcoded.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

/** Token storage keys */
const TOKEN_KEY = 'atlas-core-jwt';
const REFRESH_TOKEN_KEY = 'atlas-core-refresh-jwt';

/* ═══════════════════════════════════════════════════════════
   TOKEN MANAGEMENT
   ═══════════════════════════════════════════════════════════ */

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(access: string, refresh?: string): void {
  localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/* ═══════════════════════════════════════════════════════════
   CUSTOM ERROR
   ═══════════════════════════════════════════════════════════ */

export class AtlasAPIError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(message: string, status: number, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AtlasAPIError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/* ═══════════════════════════════════════════════════════════
   CORE REQUEST FUNCTION
   ═══════════════════════════════════════════════════════════ */

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Skip JWT injection (for login, public endpoints) */
  auth?: boolean;
}

export async function atlasRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, auth = true, ...fetchOptions } = options;

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> ?? {}),
  };

  // Inject JWT if auth required
  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE}${endpoint}`;

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle non-OK
  if (!res.ok) {
    if (res.status === 401) {
      clearTokens();
      window.dispatchEvent(new CustomEvent('atlas:unauthorized'));
    }
    const errorBody = await res.json().catch(() => null) as AtlasAPIErrorType | null;
    throw new AtlasAPIError(
      errorBody?.error?.message ?? `HTTP ${res.status}`,
      res.status,
      errorBody?.error?.code ?? 'UNKNOWN_ERROR',
      errorBody?.error?.details,
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  const json = await res.json();

  // Unwrap { data: ... } envelope if present
  return (json && typeof json === 'object' && 'data' in json ? json.data : json) as T;
}

/* ═══════════════════════════════════════════════════════════
   AUTH ENDPOINTS
   ═══════════════════════════════════════════════════════════ */

export const authApi = {
  /** POST /auth/login */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const res = await atlasRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: credentials,
      auth: false,
    });
    setTokens(res.token, res.refreshToken);
    return res;
  },

  /** POST /auth/register (KYC-0 auto) */
  async register(data: { email: string; password: string; nickname?: string }): Promise<LoginResponse> {
    const res = await atlasRequest<LoginResponse>('/auth/register', {
      method: 'POST',
      body: data,
      auth: false,
    });
    setTokens(res.token, res.refreshToken);
    return res;
  },

  /** POST /auth/refresh */
  async refresh(): Promise<{ token: string }> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const res = await atlasRequest<{ token: string }>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    });
    setTokens(res.token);
    return res;
  },

  /** POST /auth/logout */
  async logout(): Promise<void> {
    try {
      await atlasRequest('/auth/logout', { method: 'POST' });
    } finally {
      clearTokens();
    }
  },

  /** GET /auth/me */
  async me(): Promise<AuthenticatedUser> {
    return atlasRequest<AuthenticatedUser>('/auth/me');
  },

  /** PATCH /auth/password */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    return atlasRequest('/auth/password', {
      method: 'PATCH',
      body: { currentPassword, newPassword },
    });
  },
};

/* ═══════════════════════════════════════════════════════════
   WALLET ENDPOINTS
   ═══════════════════════════════════════════════════════════ */

export const walletApi = {
  /** GET /wallets */
  async list(): Promise<Wallet[]> {
    return atlasRequest('/wallets');
  },

  /** GET /wallets/summary */
  async summary(): Promise<WalletSummary[]> {
    return atlasRequest('/wallets/summary');
  },
};

/* ═══════════════════════════════════════════════════════════
   TRANSACTION (LEDGER) ENDPOINTS
   ═══════════════════════════════════════════════════════════ */

export const transactionApi = {
  /** GET /transactions — with filters */
  async list(filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams(
      Object.entries(filters ?? {})
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)]),
    );
    return atlasRequest(`/transactions${params.toString() ? `?${params}` : ''}`);
  },

  /** GET /transactions/:id */
  async getById(id: string): Promise<Transaction> {
    return atlasRequest(`/transactions/${id}`);
  },
};

/* ═══════════════════════════════════════════════════════════
   CORE FLOW ENDPOINTS (IN, SWAP, OUT)
   ═══════════════════════════════════════════════════════════ */

export const depositApi = {
  /** POST /deposits — Iniciar depósito, devolve rotas disponíveis */
  async initiate(data: DepositRequest): Promise<DepositResponse> {
    return atlasRequest('/deposits', { method: 'POST', body: data });
  },

  /** GET /deposits/routes — Ver rotas disponíveis sem iniciar */
  async getRoutes(currency: Currency): Promise<DepositResponse['routes']> {
    return atlasRequest(`/deposits/routes?currency=${currency}`);
  },
};

export const swapApi = {
  /** POST /swaps — Executar câmbio */
  async execute(data: SwapRequest): Promise<SwapResponse> {
    return atlasRequest('/swaps', { method: 'POST', body: data });
  },
};

export const payoutApi = {
  /** POST /payouts — Solicitar levantamento */
  async request(data: PayoutRequest): Promise<PayoutResponse> {
    return atlasRequest('/payouts', { method: 'POST', body: data });
  },
};

/* ═══════════════════════════════════════════════════════════
   KYC ENDPOINTS
   ═══════════════════════════════════════════════════════════ */

export const kycApi = {
  /** POST /kyc/tier1 — Submeter registo inicial */
  async submitTier1(data: KYCTier1Request): Promise<User> {
    return atlasRequest('/kyc/tier1', { method: 'POST', body: data });
  },

  /** POST /kyc/tier2 — Submeter dados declarativos */
  async submitTier2(data: KYCTier2Request): Promise<User> {
    return atlasRequest('/kyc/tier2', { method: 'POST', body: data });
  },

  /** GET /kyc/status — Estado atual do KYC */
  async status(): Promise<{ tier: TierLevel; pendingReview: boolean; nextSteps: string[] }> {
    return atlasRequest('/kyc/status');
  },

  /** GET /kyc/verification-url — URL para KYC-3 (liveness) */
  async getVerificationUrl(): Promise<{ url: string; provider: string }> {
    return atlasRequest('/kyc/verification-url');
  },
};

/* ═══════════════════════════════════════════════════════════
   ADMIN / OPERATOR ENDPOINTS
   ═══════════════════════════════════════════════════════════ */

export const adminApi = {
  /** GET /admin/users — Listar utilizadores */
  async listUsers(page?: number, limit?: number): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    return atlasRequest(`/admin/users${params.toString() ? `?${params}` : ''}`);
  },

  /** GET /admin/tickets — Listar OperationTickets */
  async listTickets(status?: TicketStatus): Promise<PaginatedResponse<OperationTicket>> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    return atlasRequest(`/admin/tickets${params.toString() ? `?${params}` : ''}`);
  },

  /** PATCH /admin/tickets/:id — Atualizar ticket */
  async updateTicket(id: string, data: { status: TicketStatus; resolutionNotes?: string }): Promise<OperationTicket> {
    return atlasRequest(`/admin/tickets/${id}`, { method: 'PATCH', body: data });
  },

  /** GET /admin/organizations — Listar organizações */
  async listOrganizations(): Promise<Organization[]> {
    return atlasRequest('/admin/organizations');
  },

  /** GET /admin/fee-schedule — Listar fee schedules */
  async listFeeSchedules(): Promise<FeeSchedule[]> {
    return atlasRequest('/admin/fee-schedules');
  },

  /** POST /admin/fee-schedule — Criar fee schedule */
  async createFeeSchedule(data: Omit<FeeSchedule, 'id'>): Promise<FeeSchedule> {
    return atlasRequest('/admin/fee-schedules', { method: 'POST', body: data });
  },
};

/* ═══════════════════════════════════════════════════════════
   MERCHANT — Checkout & Lojas, Smart Links, Mini-CRM, API Keys
   ═══════════════════════════════════════════════════════════ */

export const merchantApi = {
  /** GET /internal/stores — Obter config da loja */
  async getStoreConfig(): Promise<StoreCheckout> {
    return atlasRequest('/internal/stores');
  },

  /** PUT /internal/stores — Atualizar config da loja */
  async updateStoreConfig(data: StoreCheckoutConfig): Promise<StoreCheckout> {
    return atlasRequest('/internal/stores', { method: 'PUT', body: data });
  },

  /** GET /internal/links — Listar smart payment links */
  async listPaymentLinks(): Promise<SmartPaymentLink[]> {
    return atlasRequest('/internal/links');
  },

  /** POST /internal/links — Criar smart payment link */
  async createPaymentLink(data: {
    title: string;
    description?: string;
    amount: number;
    currency: string;
    is_single_use: boolean;
    success_url?: string;
  }): Promise<SmartPaymentLink> {
    return atlasRequest('/internal/links', { method: 'POST', body: data });
  },

  /** GET /internal/customers — Listar clientes (Mini-CRM) */
  async listCustomers(): Promise<CheckoutCustomer[]> {
    return atlasRequest('/internal/customers');
  },

  /** GET /merchant/api-keys — Obter chave API do Merchant
   *  Response: { apiKey: "sk_live_...", storeName: "..." }
   */
  async getApiKey(): Promise<MerchantApiKeyResponse> {
    return atlasRequest('/merchant/api-keys');
  },

  /** POST /merchant/api-keys/generate — Gerar nova chave API
   *  Response: { apiKey: "sk_live_..." }
   */
  async generateApiKey(): Promise<MerchantApiKeyResponse> {
    return atlasRequest('/merchant/api-keys/generate', {
      method: 'POST',
      body: {},
    });
  },
};

/* ═══════════════════════════════════════════════════════════
   PUBLIC ENDPOINTS (no auth required)
   ═══════════════════════════════════════════════════════════ */

export const publicApi = {
  /** GET /public/rates — Exchange rates (base: USDT) */
  async rates(): Promise<ExchangeRate[]> {
    return atlasRequest('/public/rates', { auth: false });
  },
};

/* ═══════════════════════════════════════════════════════════
   AGGREGATED EXPORT
   ═══════════════════════════════════════════════════════════ */

export const atlas = {
  auth: authApi,
  wallets: walletApi,
  transactions: transactionApi,
  deposits: depositApi,
  swaps: swapApi,
  payouts: payoutApi,
  kyc: kycApi,
  admin: adminApi,
  merchant: merchantApi,
  public: publicApi,
};

export default atlas;
