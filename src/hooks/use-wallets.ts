/**
 * Atlas Core — Wallet & Transaction Hooks (React Query)
 * 
 * V3.0 — Usa atlas-client.ts em vez de Supabase.
 * Suporta 4-balance model: Incoming, Pending, Available, Blocked.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  walletApi,
  transactionApi,
  depositApi,
  swapApi,
  payoutApi,
  adminApi,
  kycApi,
} from '@/lib/api/atlas-client';
import type {
  Wallet,
  WalletSummary,
  DepositRequest,
  DepositResponse,
  SwapRequest,
  SwapResponse,
  PayoutRequest,
  PayoutResponse,
  TransactionFilters,
  PaginatedResponse,
  Transaction,
  OperationTicket,
  TicketStatus,
  FeeSchedule,
  KYCTier1Request,
  KYCTier2Request,
  TierLevel,
} from '@/types/atlas';

/* ═══════════════════════════════════════════════════════════
   WALLETS
   ═══════════════════════════════════════════════════════════ */

export function useWallets() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletApi.list(),
  });
}

export function useWalletSummary() {
  return useQuery({
    queryKey: ['wallets', 'summary'],
    queryFn: () => walletApi.summary(),
  });
}

/** Aggregate totals across all wallets */
export function useWalletTotals() {
  return useQuery({
    queryKey: ['wallets', 'totals'],
    queryFn: async () => {
      const wallets = await walletApi.list();
      return wallets.reduce(
        (acc, w) => {
          acc.incoming += w.balanceIncoming;
          acc.pending += w.balancePending;
          acc.available += w.balanceAvailable;
          acc.blocked += w.balanceBlocked;
          acc.total += w.balanceIncoming + w.balancePending + w.balanceAvailable + w.balanceBlocked;
          return acc;
        },
        { incoming: 0, pending: 0, available: 0, blocked: 0, total: 0 },
      );
    },
  });
}

/* ═══════════════════════════════════════════════════════════
   TRANSACTIONS (LEDGER)
   ═══════════════════════════════════════════════════════════ */

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionApi.list(filters),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionApi.getById(id),
    enabled: !!id,
  });
}

/* ═══════════════════════════════════════════════════════════
   CORE FLOWS
   ═══════════════════════════════════════════════════════════ */

export function useDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DepositRequest) => depositApi.initiate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDepositRoutes(currency: string) {
  return useQuery({
    queryKey: ['deposit-routes', currency],
    queryFn: () => depositApi.getRoutes(currency as 'EUR' | 'BRL' | 'USDT' | 'USD'),
    enabled: !!currency,
  });
}

export function useSwap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SwapRequest) => swapApi.execute(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function usePayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PayoutRequest) => payoutApi.request(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

/* ═══════════════════════════════════════════════════════════
   KYC
   ═══════════════════════════════════════════════════════════ */

export function useKYCStatus() {
  return useQuery({
    queryKey: ['kyc', 'status'],
    queryFn: () => kycApi.status(),
  });
}

export function useSubmitKYCTier1() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: KYCTier1Request) => kycApi.submitTier1(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kyc'] });
    },
  });
}

export function useSubmitKYCTier2() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: KYCTier2Request) => kycApi.submitTier2(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kyc'] });
    },
  });
}

/* ═══════════════════════════════════════════════════════════
   ADMIN / OPERATOR
   ═══════════════════════════════════════════════════════════ */

export function useOperationTickets(status?: TicketStatus) {
  return useQuery({
    queryKey: ['tickets', status],
    queryFn: () => adminApi.listTickets(status),
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; status: TicketStatus; resolutionNotes?: string }) =>
      adminApi.updateTicket(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useFeeSchedules() {
  return useQuery({
    queryKey: ['fee-schedules'],
    queryFn: () => adminApi.listFeeSchedules(),
  });
}

/* ═══════════════════════════════════════════════════════════
   MERCHANT — Stores, Payment Links, Gateways
   ═══════════════════════════════════════════════════════════ */

export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      // Stores will be fetched from the Atlas Core API when endpoint is ready
      return [] as import('@/types/atlas').Store[];
    },
  });
}

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      // Will connect to Atlas Core API when endpoint is ready
      return { id: 'mock', name: data.name };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

export function usePaymentLinks() {
  return useQuery({
    queryKey: ['payment-links'],
    queryFn: async () => {
      // Will connect to Atlas Core API when endpoint is ready
      return [] as import('@/types/atlas').PaymentLink[];
    },
  });
}

export function useCreatePaymentLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { amount: number | string; currency: string; store_id?: string; customer_email?: string }) => {
      return { id: 'mock', shareable_url: '' };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-links'] });
    },
  });
}

export function useGateways() {
  return useQuery({
    queryKey: ['gateways'],
    queryFn: async () => {
      // Will connect to Atlas Core API when endpoint is ready
      return [] as import('@/types/atlas').Gateway[];
    },
  });
}

export function useConfigureGateway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { gateway_id: string; config: Record<string, unknown> }) => {
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gateways'] });
    },
  });
}
