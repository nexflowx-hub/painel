---
Task ID: 2
Agent: Main Agent
Task: Restruturar Frontend Atlas Core — remover Supabase, conectar à Atlas Core Banking API

Work Log:
- Criou src/types/atlas.ts — Tipos TypeScript rigorosos espelhando o Prisma Schema (30+ tipos, enums, interfaces)
- Criou src/lib/api/atlas-client.ts — API Client com fetch nativo, JWT interceptor, DEV_MOCK mode com respostas mock completas
- Criou src/lib/rbac.ts — Matriz RBAC com 17 secções, 3 categorias (operation, merchant, administration), 3 roles (customer, merchant, admin)
- Refatorou src/lib/auth-store.ts — Removido 100% Supabase. Auth via Atlas Core API + JWT. DEV_MOCK bypass.
- Atualizou src/lib/dashboard-store.ts — Integração com RBAC para validar secções acessíveis
- Reescreveu src/hooks/use-wallets.ts — Todos hooks usam atlas-client.ts. 4-balance model. 15+ hooks.
- Atualizou src/components/dashboard/sidebar.tsx — RBAC dinâmico, categorias de menu, rebrand "Atlas Core"
- Atualizou src/components/dashboard/login-page.tsx — Atlas ID + Password, DEV_MOCK mode, rebrand
- Atualizou src/components/dashboard/header.tsx — Badge de KYC tier, role config, novas secções
- Atualizou src/components/dashboard/footer.tsx — Rebrand Atlas Core Banking, NeXFlowX Technologies
- Atualizou src/components/dashboard/dashboard-shell.tsx — Novas secções placeholder (kyc, fee-schedule, users)
- Atualizou src/components/dashboard/dashboard-overview.tsx — 4 KPIs (Incoming, Pending, Available, Blocked)
- Atualizou src/components/dashboard/wallet-cards.tsx — 4 saldos, camelCase fields, payoutApi
- Atualizou src/components/dashboard/swap-widget.tsx — swapApi, novos tipos SwapRequest/SwapResponse
- Atualizou src/components/dashboard/payout-widget.tsx — payoutApi, PayoutRequest/PayoutResponse
- Atualizou src/components/dashboard/deposit-widget.tsx — depositApi, rotas PIX/Stripe/Bank
- Atualizou src/components/dashboard/financial-activity-table.tsx — Novos TransactionType/Status
- Atualizou src/components/dashboard/admin-approval-table.tsx — OperationTickets, TicketType/Status
- Atualizou src/components/dashboard/system-liquidity-panel.tsx — 4-balance aggregation
- Atualizou src/components/dashboard/settings-security.tsx — Removido Supabase, authApi.changePassword
- Atualizou src/components/dashboard/api-management.tsx — Removido antigo api/client
- Atualizou src/app/layout.tsx — Rebrand completo "Atlas Core Banking"
- Configurou .env.local — NEXT_PUBLIC_ENABLE_DEV_MOCK=true
- Removido src/lib/supabase.ts, src/lib/api/client.ts, src/lib/api/contracts.ts
- GET / 200 compilado com sucesso

Stage Summary:
- Arquitetura V3.0 implementada: Supabase totalmente removido
- Frontend consome estritamente Atlas Core Banking API REST
- DEV_MOCK mode ativo para funcionar sem backend real
- JWT storage em localStorage com auto-injeção em requests
- RBAC: 3 roles, 17 secções, menu dinâmico por permissão
- 4-balance model: Incoming, Pending, Available, Blocked
- Novos fluxos: KYC progressivo (Tier 0-3), Fee Schedule, Operation Tickets

---
Task ID: 3
Agent: Main Agent
Task: Fix client-side crash after login (USDT currency error + 404 routes + manifest warnings)

Work Log:
- Identified root cause: dashboard-overview.tsx fmt() function lacked try-catch for non-ISO currency codes (USDT is not valid for Intl.NumberFormat)
- Added try-catch with symbol fallback map for USDT (₮), BTC (₿), ETH (Ξ), USDC
- Created missing legal page routes: /legal/terms, /legal/privacy, /legal/refund (all returning 200)
- Rebranded legal layout from "Atlas Global Payments" to "Atlas Core Banking"
- Fixed manifest.json: added params object to share_target (was causing browser warning), rebranded app name/id
- Created minimal favicon.ico (teal 16x16) to prevent 404 on favicon requests
- All routes verified: / (200), /legal/terms (200), /legal/privacy (200), /legal/refund (200)

Stage Summary:
- Root crash fixed: USDT currency in NumberFormat now handled gracefully
- 3 new legal pages created with proper content
- Manifest warnings resolved
- Pushed to GitHub: commit cf11396

---
Task ID: 4
Agent: Main Agent
Task: 3 Bugs Críticos — RBAC, API Management, Motor de Taxas

Work Log:
- RBAC: Removida role 'admin' hardcoded em dashboard-store.ts (linha 31)
- RBAC: Adicionada mapBackendRole() em auth-store.ts para mapear roles do backend ('operator'→admin, 'user'→merchant, 'seller'→merchant)
- RBAC: Login, Register e validateToken normalizam roles via mapBackendRole() antes de armazenar
- RBAC: dashboard-store.ts agora lê role dinamicamente via useAuthStore.getState()
- RBAC: getUserRole() refatorada para usar mapBackendRole() internamente
- RBAC: Sidebar já usava getUserRole(user) — funcionamento verificado
- RBAC: Aprovações e Liquidez ocultadas automaticamente (RBAC_MATRIX: minRole='admin')

- API Management: Adicionados tipos MerchantApiKey e MerchantApiKeyCreated ao atlas-client.ts
- API Management: Adicionados merchantApi.listApiKeys() (GET /api/merchant/api-keys) e merchantApi.generateApiKey() (POST /api/merchant/api-keys/generate)
- API Management: Adicionados mock responses com chaves sk_live_atlas_... realistas
- API Management: api-management.tsx reescrito para usar merchantApi em vez de fetch('/api/api-keys') local
- API Management: ApiKeysTab agora mostra key_prefix, label, status, last_used_at
- API Management: Chave gerada mostrada uma única vez com aviso de segurança

- Motor de Taxas: Adicionada publicApi.rates() (GET /api/public/rates) ao atlas-client.ts
- Motor de Taxas: Adicionado tipo ExchangeRate { base, currency, rate, timestamp }
- Motor de Taxas: Mock data com taxas base USDT: EUR (0.9215), BRL (5.4320), USD (1.0), BTC, ETH, GBP
- Motor de Taxas: swap-widget.tsx reescrito — removeu resolveProvider() hardcoded
- Motor de Taxas: Implementado crossRate() para calcular taxa entre qualquer par via USDT
- Motor de Taxas: Taxas carregadas via useEffect + fetchRates() na montagem
- Motor de Taxas: Indicador LIVE com timestamp, botão de refresh, estado de erro

Stage Summary:
- 5 ficheiros modificados: auth-store.ts, dashboard-store.ts, atlas-client.ts, api-management.tsx, swap-widget.tsx
- TypeScript compila sem erros (0 erros em src/)
- GET / 200 verificado
- Pushed to GitHub: commit ac94f1a
