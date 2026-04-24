/**
 * Atlas Global Payments — API Client V1.01 (NeXFlowX Engine)
 * BaaS (Banking as a Service) — Settlement Engine
 */

import type {
  LoginRequest, LoginResponse, AuthMeResponse, WalletsResponse,
  SwapRequest, SwapResponse, PayoutRequest, PayoutResponse,
  CreatePaymentLinkRequest, CreatePaymentLinkResponse, PaymentLinksResponse,
  LedgerResponse,
  ActionTicketsResponse, ApproveTicketResponse,
  ChangePasswordRequest, ChangePasswordResponse,
  UpdateEmailRequest, UpdateEmailResponse,
  ApiKeysResponse, CreateApiKeyResponse,
  UserMeResponse, UpdateUserMeRequest, UpdateUserMeResponse,
  StoresResponse, GatewaysResponse, DepositRequest, DepositResponse,
  APIError,
} from './contracts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api-core.nexflowx.tech/api/v1';
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
  const token = typeof window !== 'undefined' ? localStorage.getItem('nexflowx_token') : null;
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
  return res.json() as Promise<T>;
}

export const auth = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) });
    if (typeof window !== 'undefined' && res.token) localStorage.setItem('nexflowx_token', res.token);
    return res;
  },
  async logout(): Promise<void> {
    try { await request('/auth/logout', { method: 'POST' }); } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nexflowx_token');
        localStorage.removeItem('nexflowx_refresh');
      }
    }
  },
  async me(): Promise<AuthMeResponse> { return request('/auth/me'); },
};

export const wallets = {
  async list(): Promise<WalletsResponse> { return request('/wallets'); },
};

export const swap = {
  async execute(data: SwapRequest): Promise<SwapResponse> {
    return request('/swap', { method: 'POST', body: JSON.stringify(data) });
  },
};

export const payout = {
  async request(data: PayoutRequest): Promise<PayoutResponse> {
    return request('/payout', { method: 'POST', body: JSON.stringify(data) });
  },
};

export const deposits = {
  async create(data: DepositRequest): Promise<DepositResponse> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nexflowx_token') : null;
    return request('/deposits', {
      method: 'POST',
      headers: { ...(token ? { 'x-api-key': token } : {}) },
      body: JSON.stringify(data),
    });
  },
};

export const paymentLinks = {
  async list(): Promise<PaymentLinksResponse> { return request('/payment-links'); },
  async create(data: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse> {
    return request('/payment-links', { method: 'POST', body: JSON.stringify(data) });
  },
};

export const ledger = {
  async list(query: Record<string, string> = {}): Promise<LedgerResponse> {
    const params = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v != null) as [string, string][]
    );
    return request(`/ledger${params.toString() ? `?${params}` : ''}`);
  },
};

export const actionTickets = {
  async list(): Promise<ActionTicketsResponse> { return request('/action-tickets'); },
  async approve(id: string): Promise<ApproveTicketResponse> {
    return request(`/action-tickets/${id}/approve`, { method: 'POST' });
  },
};

export const settings = {
  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return request('/users/me/password', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateEmail(data: UpdateEmailRequest): Promise<UpdateEmailResponse> {
    return request('/users/me', { method: 'PATCH', body: JSON.stringify(data) });
  },
};

export const apiKeys = {
  async list(): Promise<ApiKeysResponse> { return request('/api-keys'); },
  async create(label?: string): Promise<CreateApiKeyResponse> {
    return request('/api-keys', { method: 'POST', body: JSON.stringify(label ? { label } : {}) });
  },
};

export const users = {
  async getMe(): Promise<UserMeResponse> { return request('/users/me'); },
  async updateMe(data: UpdateUserMeRequest): Promise<UpdateUserMeResponse> {
    return request('/users/me', { method: 'PATCH', body: JSON.stringify(data) });
  },
};

export const stores = {
  async list(): Promise<StoresResponse> { return request('/stores'); },
  async create(data: { name: string }): Promise<{ data: { id: string; store_id: string } }> {
    return request('/stores', { method: 'POST', body: JSON.stringify(data) });
  },
};

export const gateways = {
  async list(): Promise<GatewaysResponse> { return request('/settings/gateways'); },
  async configure(data: { gateway_id: string; config: Record<string, unknown> }): Promise<{ success: boolean }> {
    return request('/settings/gateways', { method: 'POST', body: JSON.stringify(data) });
  },
};

export const api = { auth, wallets, swap, payout, deposits, paymentLinks, stores, gateways, ledger, actionTickets, settings, apiKeys, users };
