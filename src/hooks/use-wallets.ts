'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { PayoutMethod } from '@/lib/api/contracts';
import { mapWallet, mapActionTicket, mapStore, mapGateway, mapPaymentLink } from '@/lib/api/contracts';

type RawRecord = Record<string, unknown>;

export function useWallets() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      const res = await api.wallets.list();
      // API client unwraps { data: ... }, so res is Wallet[] directly
      const raw: RawRecord[] = Array.isArray(res) ? (res as unknown as RawRecord[]) : [];
      return raw.map(mapWallet);
    },
  });
}

export function useSwap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { amount: number; from_currency: string; to_currency: string }) => {
      return api.swap.execute(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wallets'] }); qc.invalidateQueries({ queryKey: ['ledger'] }); },
  });
}

export function usePayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { amount: number; currency: string; method: PayoutMethod; destination: string }) => {
      return api.payout.request(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wallets'] }); qc.invalidateQueries({ queryKey: ['ledger'] }); },
  });
}

export function useDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { amount: number | string; currency: string; store_id?: string; customer_email?: string }) => {
      return api.deposits.create(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wallets'] }); qc.invalidateQueries({ queryKey: ['ledger'] }); qc.invalidateQueries({ queryKey: ['payment-links'] }); },
  });
}

export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const res = await api.stores.list();
      // API client unwraps { data: ... }, so res is Store[] directly
      const raw: RawRecord[] = Array.isArray(res) ? (res as unknown as RawRecord[]) : [];
      return raw.map(mapStore);
    },
  });
}

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string }) => api.stores.create(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stores'] }); },
  });
}

export function useGateways() {
  return useQuery({
    queryKey: ['gateways'],
    queryFn: async () => {
      const res = await api.gateways.list();
      // API client unwraps { data: ... }, so res is Gateway[] directly
      const raw: RawRecord[] = Array.isArray(res) ? (res as unknown as RawRecord[]) : [];
      return raw.map(mapGateway);
    },
  });
}

export function useConfigureGateway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { gateway_id: string; config: Record<string, unknown> }) => api.gateways.configure(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gateways'] }); },
  });
}

export function usePaymentLinks() {
  return useQuery({
    queryKey: ['payment-links'],
    queryFn: async () => {
      const res = await api.paymentLinks.list();
      // API client unwraps { data: ... }, so res is PaymentLink[] directly
      const raw: RawRecord[] = Array.isArray(res) ? (res as unknown as RawRecord[]) : [];
      return raw.map(mapPaymentLink);
    },
  });
}

export function useCreatePaymentLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { amount: number | string; currency: string; store_id?: string; customer_email?: string }) => {
      return api.paymentLinks.create(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payment-links'] }); qc.invalidateQueries({ queryKey: ['ledger'] }); },
  });
}

export function useLedger(query: Record<string, string> = {}) {
  return useQuery({
    queryKey: ['ledger', query],
    queryFn: async () => { return api.ledger.list(query); },
  });
}

export function useActionTickets() {
  return useQuery({
    queryKey: ['action-tickets'],
    queryFn: async () => {
      const res = await api.actionTickets.list();
      // API client unwraps { data: ... }, so res is ActionTicket[] directly
      const raw: RawRecord[] = Array.isArray(res) ? (res as unknown as RawRecord[]) : [];
      return raw.map(mapActionTicket);
    },
  });
}

export function useApproveTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.actionTickets.approve(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['action-tickets'] }); },
  });
}
