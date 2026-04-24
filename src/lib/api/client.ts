/**
 * Atlas Global Payments — API Client V2.0 (NeXFlowX Engine)
 * BaaS (Banking as a Service) — Settlement Engine
 *
 * Key changes from V1:
 * - Auth handled by Supabase (no /auth/* endpoints)
 * - All responses unwrapped from { data: ... } automatically
 * - Admin endpoints added
 * - Token sourced from Supabase session
 */

import type {
  WalletsResponse,
  SwapRequest, SwapResponse, PayoutRequest, PayoutResponse,
  CreatePaymentLinkRequest, CreatePaymentLinkResponse, PaymentLinksResponse,
  LedgerResponse,
  ActionTicketsResponse, ApproveTicketResponse,
  UpdateEmailRequest, UpdateEmailResponse,
  ApiKeysResponse, CreateApiKeyResponse,
  UserMeResponse, UpdateUserMeRequest, UpdateUserMeResponse,
  StoresResponse, GatewaysResponse, DepositRequest, DepositResponse,
  AdminUsersResponse, AdminPendingPayoutsResponse,
  APIError,
} from './contracts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.atlasglobal.digital/api/v1';
export const BACKEND_BASE_URL = API_BASE;

export class NexFlowXAPIError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'NexFlowXAPIError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Get token from Supabase session instead of localStorage
  const { supabase } = await import('@/lib/supabase');
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) ?? {}),
  };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, mode: 'cors', headers });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as APIError | null;
    throw new NexFlowXAPIError(
      body?.error?.message ?? body?.message ?? `HTTP ${res.status}`, res.status,
      body?.error?.code ?? 'UNKNOWN_ERROR'
    );
  }

  // Unwrap the { data: ... } wrapper that the new backend applies to all responses
  const json = await res.json();
  // If the response has a `data` key, unwrap it; otherwise return as-is
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as { data: T }).data as T;
  }
  return json as T;
}

/* ─── Wallets (3-Stage Settlement) ─── */
export const wallets = {
  async list(): Promise<WalletsResponse> { return request('/wallets'); },
};

/* ─── Swap ─── */
export const swap = {
  async execute(data: SwapRequest): Promise<SwapResponse> {
    return request('/swap', { method: 'POST', body: JSON.stringify(data) });
  },
};

/* ─── Payout ─── */
export const payout = {
  async request(data: PayoutRequest): Promise<PayoutResponse> {
    return request('/payout', { method: 'POST', body: JSON.stringify(data) });
  },
};

/* ─── Deposits ─── */
export const deposits = {
  async create(data: DepositRequest): Promise<DepositResponse> {
    return request('/deposits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/* ─── Payment Links ─── */
export const paymentLinks = {
  async list(): Promise<PaymentLinksResponse> { return request('/payment-links'); },
  async create(data: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse> {
    return request('/payment-links', { method: 'POST', body: JSON.stringify(data) });
  },
};

/* ─── Stores (Multi-Tenant) ─── */
export const stores = {
  async list(): Promise<StoresResponse> { return request('/stores'); },
  async create(data: { name: string }): Promise<{ id: string; store_id: string }> {
    return request('/stores', { method: 'POST', body: JSON.stringify(data) });
  },
};

/* ─── Gateways ─── */
export const gateways = {
  async list(): Promise<GatewaysResponse> { return request('/settings/gateways'); },
  async configure(data: { gateway_id: string; config: Record<string, unknown> }): Promise<{ success: boolean }> {
    return request('/settings/gateways', { method: 'POST', body: JSON.stringify(data) });
  },
};

/* ─── Ledger ─── */
export const ledger = {
  async list(query: Record<string, string> = {}): Promise<LedgerResponse> {
    const params = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v != null) as [string, string][]
    );
    return request(`/ledger${params.toString() ? `?${params}` : ''}`);
  },
};

/* ─── Action Tickets ─── */
export const actionTickets = {
  async list(): Promise<ActionTicketsResponse> { return request('/action-tickets'); },
  async approve(id: string): Promise<ApproveTicketResponse> {
    return request(`/action-tickets/${id}/approve`, { method: 'POST' });
  },
};

/* ─── Settings ─── */
export const settings = {
  async updateEmail(data: UpdateEmailRequest): Promise<UpdateEmailResponse> {
    return request('/users/me', { method: 'PATCH', body: JSON.stringify(data) });
  },
};

/* ─── API Keys ─── */
export const apiKeys = {
  async list(): Promise<ApiKeysResponse> { return request('/api-keys'); },
  async create(label?: string): Promise<CreateApiKeyResponse> {
    return request('/api-keys', { method: 'POST', body: JSON.stringify(label ? { label } : {}) });
  },
};

/* ─── Users ─── */
export const users = {
  async getMe(): Promise<UserMeResponse> { return request('/users/me'); },
  async updateMe(data: UpdateUserMeRequest): Promise<UpdateUserMeResponse> {
    return request('/users/me', { method: 'PATCH', body: JSON.stringify(data) });
  },
};

/* ─── Admin ─── */
export const admin = {
  async listUsers(): Promise<AdminUsersResponse> { return request('/admin/users'); },
  async pendingPayouts(): Promise<AdminPendingPayoutsResponse> { return request('/admin/payouts/pending'); },
};

/* ─── Aggregated API export ─── */
export const api = {
  wallets, swap, payout, deposits, paymentLinks, stores, gateways,
  ledger, actionTickets, settings, apiKeys, users, admin,
};
