---
Task ID: 1
Agent: Main Agent
Task: Remove ALL mock data and verify 3 critical bugs are connected to real Atlas Core API endpoints

Work Log:
- Read and audited all key files: atlas-client.ts, auth-store.ts, dashboard-store.ts, rbac.ts, sidebar.tsx, api-management.tsx, swap-widget.tsx, checkout-panel.tsx, use-wallets.ts, use-merchant.ts
- Verified RBAC is production-ready: dynamic role mapping via mapBackendRole(), approvals/liquidity hidden for merchants via RBAC matrix
- Verified API Management is production-ready: real merchantApi.getApiKey() and merchantApi.generateApiKey() with correct { apiKey, storeName } format
- Verified Motor de Taxas is production-ready: real publicApi.rates() with zero hardcoded fallback rates
- Removed ALL mock data from use-wallets.ts (6 hooks cleaned: useStores, useCreateStore, usePaymentLinks, useCreatePaymentLink, useGateways, useConfigureGateway)
- Removed ALL mock data from checkout-panel.tsx (MOCK_STORE, MOCK_LINKS, MOCK_CUSTOMERS deleted — ~150 lines of fake data removed)
- Connected checkout-panel to real API: useUpdateCheckoutStore() for save, createLink.mutateAsync() for link creation
- Verified zero mock references, zero localhost hardcoded references, zero DEV_MOCK blocks
- Confirmed process.env.NEXT_PUBLIC_API_URL is the sole base URL source
- Pushed to GitHub: commit c3ce2bb

Stage Summary:
- 2 files modified: checkout-panel.tsx (-173 lines, +51 lines net), use-wallets.ts
- All 3 critical bugs verified production-ready with real backend endpoints
- Complete mock data elimination across entire codebase
- Dev server compiles cleanly, no new lint errors introduced
