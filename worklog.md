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
