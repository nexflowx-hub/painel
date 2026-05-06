/**
 * Atlas Core Banking — API Client V3.0
 * 
 * - Usa fetch nativo (sem axios, sem SDKs externos)
 * - JWT automaticamente injetado via interceptor
 * - Tipagem forte com TypeScript generics
 * - DEV_MOCK mode para funcionar sem backend real
 * - Base URL configurável via NEXT_PUBLIC_ATLAS_API_URL
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
   CONFIGURAÇÃO
   ═══════════════════════════════════════════════════════════ */

const API_BASE = process.env.NEXT_PUBLIC_ATLAS_API_URL || 'https://api.atlasglobal.digital/api/v1';

/** Token storage key */
const TOKEN_KEY = 'atlas-core-jwt';
const REFRESH_TOKEN_KEY = 'atlas-core-refresh-jwt';

/** DEV_MOCK: quando verdadeiro, o client devolve dados mock sem chamar a API */
const DEV_MOCK = process.env.NEXT_PUBLIC_ENABLE_DEV_MOCK === 'true';

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
  /** Skip JWT injection (for login, health check) */
  auth?: boolean;
}

export async function atlasRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, auth = true, ...fetchOptions } = options;

  // DEV_MOCK mode — devolve dados mock sem chamar a API
  if (DEV_MOCK) {
    return atlasMockResponse<T>(endpoint, options.method);
  }

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

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle non-OK
  if (!res.ok) {
    if (res.status === 401) {
      // Token expirado ou inválido — limpar sessão
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
    // Store tokens on successful login
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
   MERCHANT — Checkout & Lojas, Smart Links, Mini-CRM
   ═══════════════════════════════════════════════════════════ */

export const merchantApi = {
  /** GET /api/internal/stores — Obter config da loja */
  async getStoreConfig(): Promise<StoreCheckout> {
    return atlasRequest('/api/internal/stores');
  },

  /** PUT /api/internal/stores — Atualizar config da loja */
  async updateStoreConfig(data: StoreCheckoutConfig): Promise<StoreCheckout> {
    return atlasRequest('/api/internal/stores', { method: 'PUT', body: data });
  },

  /** GET /api/internal/links — Listar smart payment links */
  async listPaymentLinks(): Promise<SmartPaymentLink[]> {
    return atlasRequest('/api/internal/links');
  },

  /** POST /api/internal/links — Criar smart payment link */
  async createPaymentLink(data: {
    title: string;
    description?: string;
    amount: number;
    currency: string;
    is_single_use: boolean;
    success_url?: string;
  }): Promise<SmartPaymentLink> {
    return atlasRequest('/api/internal/links', { method: 'POST', body: data });
  },

  /** GET /api/internal/customers — Listar clientes (Mini-CRM) */
  async listCustomers(): Promise<CheckoutCustomer[]> {
    return atlasRequest('/api/internal/customers');
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
};

export default atlas;

/* ═══════════════════════════════════════════════════════════
   DEV MOCK RESPONSES
   ═══════════════════════════════════════════════════════════ */

function atlasMockResponse<T>(endpoint: string, method?: string): T {
  // Add latency to simulate network
  const delay = 200 + Math.random() * 300;
  
  // Login mock
  if (endpoint === '/auth/login' && method === 'POST') {
    return {
      token: 'dev-mock-jwt-token-atlas-core',
      refreshToken: 'dev-mock-refresh-token',
      user: {
        id: 'dev-user-001',
        email: 'admin@atlascore.io',
        fullName: 'NeXFlowX Operator',
        role: 'admin' as const,
        tier: 'TIER_3_CORPORATE' as const,
        status: 'ACTIVE' as const,
        organizationName: 'NEXOR',
        organizationId: 'dev-org-001',
      },
    } as T;
  }

  if (endpoint === '/auth/me') {
    return {
      id: 'dev-user-001',
      email: 'admin@atlascore.io',
      fullName: 'NeXFlowX Operator',
      role: 'admin' as const,
      tier: 'TIER_3_CORPORATE' as const,
      status: 'ACTIVE' as const,
      organizationName: 'NEXOR',
      organizationId: 'dev-org-001',
    } as T;
  }

  if (endpoint === '/wallets') {
    return [
      { id: 'w-1', walletReference: 'EUR-001', userId: 'dev-user-001', currency: 'EUR', balanceIncoming: 12500.00, balancePending: 3200.50, balanceAvailable: 48750.75, balanceBlocked: 1500.00, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'w-2', walletReference: 'BRL-001', userId: 'dev-user-001', currency: 'BRL', balanceIncoming: 45000.00, balancePending: 8200.00, balanceAvailable: 125000.00, balanceBlocked: 5000.00, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'w-3', walletReference: 'USDT-001', userId: 'dev-user-001', currency: 'USDT', balanceIncoming: 2200.00, balancePending: 500.00, balanceAvailable: 18500.00, balanceBlocked: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'w-4', walletReference: 'USD-001', userId: 'dev-user-001', currency: 'USD', balanceIncoming: 8000.00, balancePending: 1500.00, balanceAvailable: 32000.00, balanceBlocked: 2000.00, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ] as T;
  }

  if (endpoint.startsWith('/transactions')) {
    const types: Array<import('@/types/atlas').TransactionType> = ['PROXY_INCOMING', 'SETTLEMENT', 'PAYOUT', 'SWAP', 'FEE'];
    const statuses: Array<import('@/types/atlas').TransactionStatus> = ['COMPLETED', 'PENDING', 'INCOMING'];
    const currencies: Array<import('@/types/atlas').Currency> = ['EUR', 'BRL', 'USDT', 'USD'];
    const entries = Array.from({ length: 25 }, (_, i) => ({
      id: `tx-${i}`,
      walletId: 'w-1',
      userId: 'dev-user-001',
      type: types[i % types.length],
      status: statuses[i % statuses.length],
      amount: Math.random() * 5000 + 50,
      feeApplied: Math.random() * 25,
      currency: currencies[i % currencies.length],
      description: ['Pagamento recebido', 'Settlement batch', 'Levantamento IBAN', 'Swap EUR→USDT', 'Taxa de serviço'][i % 5],
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
    }));
    return { data: entries, pagination: { page: 1, limit: 25, total: 25, totalPages: 1 } } as T;
  }

  if (endpoint === '/deposits') {
    return {
      transactionId: 'dep-mock-001',
      status: 'PENDING' as const,
      routes: [
        { provider: 'internal', providerName: 'PIX Instantâneo', method: 'PIX', currency: 'BRL', estimatedFee: 0, estimatedArrival: '< 30s', payload: { pixCode: '00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890220Teste PIX5204000053039865802BR5925ATLAS CORE BANKING6009SAO PAULO62070503***63041D3D' } },
        { provider: 'internal', providerName: 'Transferência Bancária SEPA', method: 'BANK_TRANSFER', currency: 'EUR', estimatedFee: 0, estimatedArrival: 'D+1', payload: { bankDetails: { iban: 'PT50123456789012345678901', bic: 'BNPTPTPP', beneficiary: 'Atlas Core Banking', reference: 'DEP-001' } } },
        { provider: 'internal', providerName: 'Cartão de Crédito', method: 'CARD', currency: 'EUR', estimatedFee: 1.5, estimatedArrival: '< 1min', payload: { redirectUrl: 'https://checkout.example.com/pay' } },
        { provider: 'internal', providerName: 'Wire Transfer', method: 'BANK_TRANSFER', currency: 'USD', estimatedFee: 5, estimatedArrival: 'D+2', payload: { bankDetails: { iban: 'US12345678901234567890', bic: 'BOFAUS3N', beneficiary: 'Atlas Core Banking', reference: 'DEP-002' } } },
      ],
    } as T;
  }

  if (endpoint === '/swaps' && method === 'POST') {
    return {
      success: true,
      transactionId: 'swap-mock-001',
      from: { currency: 'EUR', amount: 1000 },
      to: { currency: 'USDT', amount: 1082.50 },
      feeApplied: 17.50,
      exchangeRate: 1.0825,
      estimatedSettlement: new Date(Date.now() + 300000).toISOString(),
    } as T;
  }

  if (endpoint === '/payouts') {
    return {
      success: true,
      transactionId: 'pay-mock-001',
      status: 'PENDING' as const,
      message: 'Levantamento submetido para aprovação.',
      estimatedSettlement: new Date(Date.now() + 86400000).toISOString(),
    } as T;
  }

  if (endpoint.startsWith('/admin/tickets')) {
    const ticketTypes: Array<import('@/types/atlas').TicketType> = ['MANUAL_WITHDRAWAL', 'TIER_UPGRADE', 'FEE_ADJUSTMENT', 'SUPPORT'];
    const ticketStatuses: Array<import('@/types/atlas').TicketStatus> = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
    const entries = Array.from({ length: 10 }, (_, i) => ({
      id: `ticket-${i}`,
      organizationId: 'dev-org-001',
      creatorId: 'op-001',
      targetUserId: `user-${i}`,
      type: ticketTypes[i % ticketTypes.length],
      status: ticketStatuses[i % ticketStatuses.length],
      description: ['Levantamento manual urgente', 'Pedido de upgrade KYC', 'Ajuste de taxa para cliente premium', 'Dúvida sobre saldo pendente'][i % 4],
      createdAt: new Date(Date.now() - i * 7200000).toISOString(),
      updatedAt: new Date(Date.now() - i * 7200000).toISOString(),
    }));
    return { data: entries, pagination: { page: 1, limit: 10, total: 10, totalPages: 1 } } as T;
  }

  if (endpoint === '/kyc/status') {
    return {
      tier: 'TIER_1_BASIC' as const,
      pendingReview: false,
      nextSteps: ['Complete o KYC-2 para aumentar os seus limites de transação.'],
    } as T;
  }

  // ── MERCHANT: Store Config ──
  if (endpoint === '/api/internal/stores' && method === 'GET') {
    return {
      id: 'dev-store-001',
      name: 'NeXFlowX Tech Store',
      slug: 'nexflowx',
      logo_url: null,
      primary_color: '#00D4AA',
      require_document: true,
      require_phone: false,
      status: 'active',
      created_at: '2025-01-15T10:00:00Z',
    } as T;
  }

  if (endpoint === '/api/internal/stores' && method === 'PUT') {
    return {
      id: 'dev-store-001',
      name: 'NeXFlowX Tech Store',
      slug: 'nexflowx',
      logo_url: null,
      primary_color: '#00D4AA',
      require_document: true,
      require_phone: false,
      status: 'active',
      created_at: '2025-01-15T10:00:00Z',
      updated_at: new Date().toISOString(),
    } as T;
  }

  // ── MERCHANT: Smart Payment Links ──
  if (endpoint === '/api/internal/links' && method === 'GET') {
    const now = Date.now();
    return [
      { id: 'lnk-001', title: 'Plano Premium Mensal', description: 'Subscrição mensal ao plano premium', amount: 29.99, currency: 'EUR' as const, status: 'active' as const, is_single_use: false, sales_count: 47, shareable_url: 'https://pay.atlasglobal.digital/nexflowx/lnk-001', success_url: '', store_id: 'dev-store-001', store_slug: 'nexflowx', created_at: new Date(now - 86400000 * 30).toISOString(), expires_at: null },
      { id: 'lnk-002', title: 'Consultoria Individual', description: 'Sessão de consultoria 1:1', amount: 150.00, currency: 'EUR' as const, status: 'active' as const, is_single_use: true, sales_count: 3, shareable_url: 'https://pay.atlasglobal.digital/nexflowx/lnk-002', success_url: '', store_id: 'dev-store-001', store_slug: 'nexflowx', created_at: new Date(now - 86400000 * 7).toISOString(), expires_at: new Date(now + 86400000 * 7).toISOString() },
      { id: 'lnk-003', title: 'Curso Online FullStack', description: 'Acesso completo ao curso de desenvolvimento web', amount: 497.00, currency: 'BRL' as const, status: 'active' as const, is_single_use: false, sales_count: 128, shareable_url: 'https://pay.atlasglobal.digital/nexflowx/lnk-003', success_url: '', store_id: 'dev-store-001', store_slug: 'nexflowx', created_at: new Date(now - 86400000 * 14).toISOString(), expires_at: null },
      { id: 'lnk-004', title: 'Template Pro Design', description: 'Pack de templates premium para Figma', amount: 79.90, currency: 'USD' as const, status: 'expired' as const, is_single_use: false, sales_count: 22, shareable_url: 'https://pay.atlasglobal.digital/nexflowx/lnk-004', success_url: '', store_id: 'dev-store-001', store_slug: 'nexflowx', created_at: new Date(now - 86400000 * 60).toISOString(), expires_at: new Date(now - 86400000 * 2).toISOString() },
      { id: 'lnk-005', title: 'API Key Enterprise', description: 'Chave API para integração enterprise', amount: 0.01, currency: 'USDT' as const, status: 'active' as const, is_single_use: true, sales_count: 0, shareable_url: 'https://pay.atlasglobal.digital/nexflowx/lnk-005', success_url: '', store_id: 'dev-store-001', store_slug: 'nexflowx', created_at: new Date(now - 3600000).toISOString(), expires_at: new Date(now + 86400000).toISOString() },
    ] as T;
  }

  if (endpoint === '/api/internal/links' && method === 'POST') {
    return {
      id: 'lnk-' + Math.random().toString(36).slice(2, 8),
      title: 'Novo Link',
      amount: 0,
      currency: 'EUR',
      status: 'active',
      is_single_use: false,
      sales_count: 0,
      shareable_url: 'https://pay.atlasglobal.digital/nexflowx/lnk-new',
      created_at: new Date().toISOString(),
    } as T;
  }

  // ── MERCHANT: Customers (Mini-CRM) ──
  if (endpoint === '/api/internal/customers') {
    const now = Date.now();
    return [
      { id: 'cust-001', name: 'João Silva', email: 'joao.silva@email.com', phone: '+351912345678', document: '234567890', document_type: 'NIF', total_spent: 1250.50, total_spent_currency: 'EUR', transactions_count: 8, last_purchase_at: new Date(now - 86400000).toISOString(), created_at: new Date(now - 86400000 * 90).toISOString() },
      { id: 'cust-002', name: 'Maria Santos', email: 'maria.santos@empresa.pt', phone: '+351923456789', document: '516842391', document_type: 'NIF', total_spent: 3420.00, total_spent_currency: 'EUR', transactions_count: 15, last_purchase_at: new Date(now - 86400000 * 3).toISOString(), created_at: new Date(now - 86400000 * 120).toISOString() },
      { id: 'cust-003', name: 'Pedro Oliveira', email: 'pedro.oliveira@gmail.com', phone: '+5511987654321', document: '123.456.789-00', document_type: 'CPF', total_spent: 890.00, total_spent_currency: 'BRL', transactions_count: 4, last_purchase_at: new Date(now - 86400000 * 10).toISOString(), created_at: new Date(now - 86400000 * 45).toISOString() },
      { id: 'cust-004', name: 'Ana Ferreira', email: 'ana.f@startup.io', document: '518736294', document_type: 'NIF', total_spent: 5600.00, total_spent_currency: 'EUR', transactions_count: 22, last_purchase_at: new Date(now - 3600000 * 5).toISOString(), created_at: new Date(now - 86400000 * 60).toISOString() },
      { id: 'cust-005', name: 'Carlos Mendes', email: 'carlos.mendes@corp.com', phone: '+351934567890', document: '987654321', document_type: 'CNPJ', total_spent: 15800.00, total_spent_currency: 'EUR', transactions_count: 45, last_purchase_at: new Date(now - 86400000 * 1).toISOString(), created_at: new Date(now - 86400000 * 200).toISOString() },
      { id: 'cust-006', name: 'Sofia Costa', email: 'sofia.costa@outlook.com', document: null, total_spent: 150.00, total_spent_currency: 'USD', transactions_count: 1, last_purchase_at: new Date(now - 86400000 * 20).toISOString(), created_at: new Date(now - 86400000 * 20).toISOString() },
    ] as T;
  }

  // Generic fallback
  return { success: true, message: 'DEV_MOCK' } as T;
}
