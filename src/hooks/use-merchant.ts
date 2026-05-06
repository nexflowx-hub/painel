/**
 * Atlas Core — Merchant Hooks (React Query)
 * 
 * V4.0 — Checkout & Lojas, Smart Payment Links, Mini-CRM
 * Comunica com Atlas Core Banking API via atlas-client.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantApi } from '@/lib/api/atlas-client';
import type {
  StoreCheckout,
  StoreCheckoutConfig,
  SmartPaymentLink,
  CheckoutCustomer,
} from '@/types/atlas';

/* ═══════════════════════════════════════════════════════════
   STORE CHECKOUT
   ═══════════════════════════════════════════════════════════ */

export function useCheckoutStore() {
  return useQuery({
    queryKey: ['checkout-store'],
    queryFn: () => merchantApi.getStoreConfig(),
  });
}

export function useUpdateCheckoutStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StoreCheckoutConfig) => merchantApi.updateStoreConfig(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checkout-store'] });
    },
  });
}

/* ═══════════════════════════════════════════════════════════
   SMART PAYMENT LINKS
   ═══════════════════════════════════════════════════════════ */

export function useSmartPaymentLinks() {
  return useQuery({
    queryKey: ['smart-payment-links'],
    queryFn: () => merchantApi.listPaymentLinks(),
  });
}

export function useCreatePaymentLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      amount: number;
      currency: string;
      is_single_use: boolean;
      success_url?: string;
    }) => merchantApi.createPaymentLink(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['smart-payment-links'] });
    },
  });
}

/* ═══════════════════════════════════════════════════════════
   MINI-CRM — CUSTOMERS
   ═══════════════════════════════════════════════════════════ */

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => merchantApi.listCustomers(),
  });
}
