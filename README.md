<div align="center">

<img src="public/logo-circular-lg.png" alt="Atlas Global Payments" width="120" />

# Atlas Global Payments — Dossiê Técnico Completo v2.0

**B2B2C Financial Orchestration Dashboard**
**Non-Custodial Payment Routing Platform**

Powered by **NeXFlowX™** Settlement Engine · Operated by **IAHUB360 LTD** (UK Reg. 16626733)

---

</div>

## 1. Visão Geral

| Campo | Detalhe |
|---|---|
| **Produto** | Atlas Global Payments — Dashboard de Orquestração Financeira |
| **Modelo** | B2B2C Non-Custodial Payment Routing |
| **Engine** | NeXFlowX™ Settlement Engine (3-Stage Settlement) |
| **Operador** | IAHUB360 LTD — Reino Unido, Reg. 16626733 |
| **Domínio** | `wallet.atlasglobal.digital` |
| **API** | `api.atlasglobal.digital/api/v1` |
| **Versão Frontend** | v1.01 |
| **Versão Dossiê** | v2.0 |

O Atlas Global Payments é uma plataforma de orquestração de pagamentos não-custodial que permite a merchants e plataformas integradas gerir carteiras multi-moeda, realizar swaps FX, processar payouts e gerar links de pagamento — tudo através de um dashboard institucional com design glassmorphism e neon glow.

O princípio arquitectónico central é **"Frontend Burro, Backend Inteligente"**: o Next.js limita-se a renderização de UI, gestão de estado (Zustand) e data fetching (React Query). Toda a lógica de negócio, criação de dados e transações passam exclusivamente pela API backend.

---

## 2. Arquitetura do Sistema

### 2.1 Princípio: "Frontend Burro, Backend Inteligente"

```
┌─────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND                      │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────┐ │
│  │ Zustand  │  │ React     │  │ Supabase Auth Client │ │
│  │ (State)  │  │ Query     │  │ (signInWithPassword) │ │
│  └──────────┘  │ (Cache)   │  └──────────────────────┘ │
│                └───────────┘                            │
│  ✅ UI Rendering     ✅ State Management                │
│  ✅ Data Fetching    ✅ Form Validation (Zod)           │
│  ❌ NO direct DB access (no Prisma in API routes)       │
│  ❌ NO business logic in frontend                       │
└──────────────────────┬──────────────────────────────────┘
                       │ Bearer Token (Supabase JWT)
                       ▼
┌─────────────────────────────────────────────────────────┐
│               NEXFLOWX BACKEND API                      │
│  ┌──────────────┐  ┌────────────┐  ┌────────────────┐ │
│  │ JWKS         │  │ Business   │  │ Settlement     │ │
│  │ Middleware    │  │ Logic      │  │ Engine         │ │
│  └──────────────┘  └────────────┘  └────────────────┘ │
│  ✅ JWT Validation    ✅ RBAC (requireRole)            │
│  ✅ All CRUD ops      ✅ Transaction processing        │
│  ✅ Webhook handling  ✅ Ledger immutability            │
└──────────────────────┬──────────────────────────────────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
        ┌──────────┐    ┌──────────────┐
        │ Supabase │    │ Database     │
        │ Auth     │    │ (SQLite/PG)  │
        └──────────┘    └──────────────┘
```

### 2.2 Authentication Architecture (Asymmetric JWKS via Supabase)

| Etapa | Componente | Ação |
|---|---|---|
| **Login** | Browser | `supabase.auth.signInWithPassword({ email, password })` |
| **Registo** | Browser | `supabase.auth.signUp({ email, password })` |
| **Provisioning** | Backend | Supabase Webhook → cria entrada na tabela `Users` |
| **API Requests** | Frontend | `Authorization: Bearer <supabase_access_token>` |
| **Validação** | Backend | Middleware valida assinatura JWT via JWKS endpoint |

O frontend **nunca** acede directamente à base de dados de produção. O Prisma no frontend é utilizado apenas para desenvolvimento local (SQLite). Em produção, todas as operações passam pela API NeXFlowX.

### 2.3 API Response Format

Todas as respostas de sucesso seguem o wrapper `{ data: { ... } }`:

```json
// GET /users/me
{
  "data": {
    "id": "usr_2xKj9m",
    "email": "admin@atlasglobal.digital",
    "role": "admin",
    "organization_id": "org_atlas",
    "webhook_url": "https://...",
    "created_at": "2025-01-15T10:30:00Z"
  }
}

// GET /wallets
{
  "data": [
    {
      "id": "wlt_eur_001",
      "currency_code": "EUR",
      "type": "merchant",
      "balance_incoming": 12500.00,
      "balance_pending": 3200.50,
      "balance_available": 8799.50,
      "balance_total": 24500.00
    }
  ]
}

// GET /ledger (com paginação)
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "total_pages": 8
  }
}
```

O cliente API do frontend (`src/lib/api/client.ts`) faz auto-unwrap automático da chave `data`.

### 2.4 CORS Configuration

| Parâmetro | Valor |
|---|---|
| **Origem Permitida** | `https://wallet.atlasglobal.digital` |
| **Métodos** | `GET, POST, PATCH, PUT, DELETE, OPTIONS` |
| **Headers Permitidos** | `Content-Type, Authorization, X-API-Key` |
| **Credenciais** | `true` |

Erros `Access-Control-Allow-Origin` foram resolvidos com whitelist explícita no backend.

---

## 3. Stack Tecnológico

| Camada | Tecnologia | Versão |
|---|---|---|
| **Framework** | Next.js (App Router, standalone output) | 16 |
| **Linguagem** | TypeScript (Strict mode) | 5 |
| **Styling** | Tailwind CSS + shadcn/ui (New York style) | 4 |
| **Client State** | Zustand (com persist middleware) | 5 |
| **Server State** | TanStack Query (staleTime: 30s) | 5 |
| **Autenticação** | Supabase Auth (JWKS Asymmetric) | 2.x |
| **Formulários** | React Hook Form + Zod | 7 / 4 |
| **Ícones** | Lucide React | 0.525+ |
| **Gráficos** | Recharts | 2 |
| **Mapa** | react-simple-maps + d3-geo | 3 / 3.1 |
| **Animações** | Framer Motion | 12 |
| **Tabelas** | TanStack Table | 8 |
| **Datas** | date-fns | 4 |
| **Runtime** | Bun | — |
| **Reverse Proxy** | Caddy | — |
| **Design** | Dark Mode · Glassmorphism · Neon Glow · Institutional Fintech | — |

---

## 4. Estrutura do Projeto

```
my-project/
├── Caddyfile                          # Reverse proxy config (port 81 → 3000)
├── package.json                       # Dependencies & scripts
├── next.config.ts                     # Next.js configuration
├── tsconfig.json                      # TypeScript strict config
├── tailwind.config.ts                 # Tailwind CSS config
├── postcss.config.mjs                 # PostCSS pipeline
├── eslint.config.mjs                  # ESLint flat config
├── components.json                    # shadcn/ui registry config
├── bun.lock                           # Bun lockfile
│
├── prisma/
│   └── schema.prisma                  # Prisma schema (SQLite dev)
│
├── db/
│   └── custom.db                      # Local SQLite database
│
├── public/
│   ├── logo.png                       # Atlas GP logo (standard)
│   ├── logo.svg                       # Atlas GP logo (vector)
│   ├── logo-trimmed.png               # Logo trimmed variant
│   ├── logo-circular.png              # Logo circular variant
│   ├── logo-circular-lg.png           # Logo circular large
│   └── robots.txt                     # SEO robots
│
├── upload/                            # Asset uploads directory
│
├── examples/
│   └── websocket/
│       ├── server.ts                  # WebSocket server example
│       └── frontend.tsx               # WebSocket frontend example
│
└── src/
    ├── app/
    │   ├── layout.tsx                 # Root layout (providers, fonts)
    │   ├── page.tsx                   # Main page (dashboard shell)
    │   ├── globals.css                # Global CSS + NeXFlowX theme
    │   └── api/
    │       └── route.ts               # Next.js API route (minimal)
    │
    ├── lib/
    │   ├── utils.ts                   # cn() utility (clsx + tailwind-merge)
    │   ├── db.ts                      # Prisma client instance
    │   ├── dashboard-store.ts         # Zustand store (sections, sidebar)
    │   ├── auth-store.ts              # Zustand auth store (persist, dev bypass)
    │   └── api/
    │       ├── client.ts              # NeXFlowX API client (fetch wrapper)
    │       └── contracts.ts           # TypeScript contracts & mappers
    │
    ├── hooks/
    │   ├── use-wallets.ts             # Wallet data hook (React Query)
    │   ├── use-mobile.ts              # Mobile detection hook
    │   └── use-toast.ts               # Toast notification hook
    │
    ├── components/
    │   ├── providers.tsx              # App providers (QueryClient, etc.)
    │   │
    │   ├── dashboard/                 # ─── Dashboard Components ───
    │   │   ├── index.ts               # Barrel exports
    │   │   ├── dashboard-shell.tsx    # Main shell (sidebar + header + content)
    │   │   ├── sidebar.tsx            # Navigation sidebar (desktop + mobile)
    │   │   ├── header.tsx             # Top header bar
    │   │   ├── login-page.tsx         # Authentication page
    │   │   ├── dashboard-overview.tsx # Section: Dashboard overview
    │   │   ├── metric-card.tsx        # KPI metric card component
    │   │   ├── glass-card.tsx         # Glassmorphism card wrapper
    │   │   ├── glow-wrapper.tsx       # Neon glow wrapper
    │   │   ├── wallet-cards.tsx       # Section: Wallet cards (3-stage)
    │   │   ├── swap-widget.tsx        # Section: FX swap widget
    │   │   ├── payout-widget.tsx      # Section: Payout withdrawal widget
    │   │   ├── deposit-widget.tsx     # Section: Deposit link generator
    │   │   ├── financial-activity-table.tsx  # Section: Ledger transactions
    │   │   ├── stores-panel.tsx       # Section: Multi-tenant stores
    │   │   ├── payment-links-panel.tsx# Section: Payment links management
    │   │   ├── gateways-panel.tsx     # Section: Gateway configuration
    │   │   ├── admin-approval-table.tsx     # Section: Admin approval tickets
    │   │   ├── system-liquidity-panel.tsx   # Section: System liquidity (admin)
    │   │   ├── api-management.tsx     # Section: API key management
    │   │   ├── settings-security.tsx  # Section: Settings & security
    │   │   ├── neon-chart.tsx         # Recharts wrapper (neon theme)
    │   │   ├── world-map-network.tsx  # Global network map (d3-geo)
    │   │   └── logo-3d.tsx moved → ui/
    │   │
    │   └── ui/                        # ─── shadcn/ui Components ───
    │       ├── accordion.tsx
    │       ├── alert.tsx
    │       ├── alert-dialog.tsx
    │       ├── aspect-ratio.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── breadcrumb.tsx
    │       ├── button.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── carousel.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       ├── collapsible.tsx
    │       ├── command.tsx
    │       ├── context-menu.tsx
    │       ├── dialog.tsx
    │       ├── drawer.tsx
    │       ├── dropdown-menu.tsx
    │       ├── form.tsx
    │       ├── hover-card.tsx
    │       ├── input.tsx
    │       ├── input-otp.tsx
    │       ├── label.tsx
    │       ├── logo-3d.tsx            # 3D logo with glow ring
    │       ├── menubar.tsx
    │       ├── navigation-menu.tsx
    │       ├── pagination.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── radio-group.tsx
    │       ├── resizable.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx
    │       ├── skeleton.tsx
    │       ├── slider.tsx
    │       ├── sonner.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── toast.tsx
    │       ├── toaster.tsx
    │       ├── toggle.tsx
    │       ├── toggle-group.tsx
    │       └── tooltip.tsx
    │
    └── types/
        └── external.d.ts              # External type declarations
```

---

## 5. Variáveis de Ambiente

```env
# ── Database (Dev only — production uses NeXFlowX API) ──
DATABASE_URL=file:/home/z/my-project/db/custom.db

# ── NeXFlowX Backend API ──
NEXT_PUBLIC_API_URL=https://api.atlasglobal.digital/api/v1

# ── Supabase Auth ──
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# ── Dev Bypass (NEVER enable in production) ──
NEXT_PUBLIC_ENABLE_DEV_BYPASS=true
```

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Dev only | Connection string para SQLite local (Prisma) |
| `NEXT_PUBLIC_API_URL` | ✅ | URL base da API NeXFlowX Backend |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL do projecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Chave anónima do Supabase |
| `NEXT_PUBLIC_ENABLE_DEV_BYPASS` | ⚠️ Dev only | Activa bypass de autenticação para desenvolvimento |

> **⚠️ AVISO:** `NEXT_PUBLIC_ENABLE_DEV_BYPASS` é automaticamente desactivado em `NODE_ENV=production`. Nunca fazer commit com valor `true` em ambientes de produção.

---

## 6. Endpoints da API (NeXFlowX-Fintech-Core)

### 6.1 Autenticação (Supabase)

| Operação | Método | Endpoint |
|---|---|---|
| Login | Client SDK | `supabase.auth.signInWithPassword({ email, password })` |
| Registo | Client SDK | `supabase.auth.signUp({ email, password })` |
| Sessão | Client SDK | `supabase.auth.getSession()` |
| Logout | Client SDK | `supabase.auth.signOut()` |

### 6.2 Core Endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/users/me` | Perfil do utilizador (role, kyc_level, settings) |
| `PATCH` | `/users/me` | Actualizar perfil/notificações |
| `GET` | `/wallets` | Carteiras 3-stage settlement |
| `POST` | `/swap` | Conversão FX (swap de moeda) |
| `POST` | `/payout` | Pedido de levantamento |
| `POST` | `/deposits` | Gerar link de depósito |
| `GET` | `/payment-links` | Listar links de pagamento |
| `POST` | `/payment-links` | Criar link de pagamento |
| `GET` | `/stores` | Gestão multi-tenant de lojas |
| `POST` | `/stores` | Criar loja |
| `GET` | `/settings/gateways` | Configuração de gateways |
| `POST` | `/settings/gateways` | Configurar gateway |
| `GET` | `/ledger` | Ledger imutável de transacções (com paginação) |
| `GET` | `/action-tickets` | Tickets de aprovação admin |
| `POST` | `/action-tickets/:id/approve` | Aprovar ticket |
| `GET` | `/api-keys` | Gestão de chaves API |
| `POST` | `/api-keys` | Criar chave API |

### 6.3 Admin Endpoints (requireRole('admin'))

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/admin/users` | Listar todos os utilizadores |
| `GET` | `/admin/payouts/pending` | Listar payouts pendentes |

### 6.4 Contratos TypeScript (Type Reference)

```typescript
// Roles
type UserRole = 'admin' | 'merchant' | 'customer';

// Wallets (3-Stage Settlement)
type WalletType = 'merchant' | 'treasury' | 'fee' | 'fx_pool';

// Ledger
type LedgerEntryType   = 'PAYIN' | 'SWAP' | 'PAYOUT' | 'FEE' | 'REFUND';
type LedgerEntryStatus = 'pending' | 'cleared' | 'failed';
type LedgerDirection   = 'CREDIT' | 'DEBIT';

// Payouts
type PayoutMethod = 'IBAN' | 'CRYPTO' | 'PIX' | 'SEPA' | 'BANK';

// Action Tickets
type ActionTicketStatus = 'pending_review' | 'approved' | 'rejected' | 'processing';
```

---

## 7. Fluxo de Autenticação (Detalhado)

### Login Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Browser │     │ Supabase │     │ Frontend │     │  Backend │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │  1. Email+Password  │            │                 │
     │─────────────────────>│            │                 │
     │  2. Session+Token    │            │                 │
     │<─────────────────────│            │                 │
     │                      │            │                 │
     │  3. GET /users/me    │            │                 │
     │  (Bearer <token>)    │            │                 │
     │──────────────────────┼────────────┼────────────────>│
     │                      │            │  4. JWKS Validate│
     │                      │            │     JWT          │
     │                      │            │                 │
     │  5. { data: { role } }            │                 │
     │<─────────────────────┼────────────┼─────────────────│
     │                      │            │                 │
     │  6. Render dashboard │            │                 │
     │     based on role    │            │                 │
```

1. Utilizador insere email + password na página de login
2. Frontend chama `supabase.auth.signInWithPassword({ email, password })`
3. Supabase valida credenciais e retorna sessão com `access_token`
4. Frontend armazena sessão (Supabase gere localStorage automaticamente)
5. Frontend faz `GET /users/me` com `Authorization: Bearer <access_token>`
6. Backend middleware valida assinatura JWT via JWKS endpoint do Supabase
7. Backend retorna perfil do utilizador incluindo `role`
8. Frontend renderiza dashboard com base no role

### Registration Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Browser │     │ Supabase │     │  Webhook │     │  Backend │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │  1. Email+Password  │            │                 │
     │─────────────────────>│            │                 │
     │  2. Auth User Created│            │                 │
     │<─────────────────────│            │                 │
     │                      │  3. Webhook│                 │
     │                      │───────────>│  4. Create User │
     │                      │            │    row in DB     │
     │                      │            │─────────────────>│
     │                      │            │                 │
     │  5. User can now login            │                 │
```

1. Utilizador insere email + password no formulário de registo
2. Frontend chama `supabase.auth.signUp({ email, password })`
3. Supabase cria utilizador de autenticação
4. Supabase Webhook dispara criação da linha `User` no backend
5. Utilizador pode então fazer login

### Dev Bypass Mode

Para ambiente de desenvolvimento, existe um mecanismo de bypass controlado pela variável `NEXT_PUBLIC_ENABLE_DEV_BYPASS`:

- Aceita **quaisquer** credenciais (sem validação real)
- Cria um utilizador fictício com role `admin`
- Token armazenado: `dev-token-bypass`
- **Desactivado automaticamente** em `NODE_ENV=production`
- Nunca deve ser activado em produção

---

## 8. Controlo de Acessos

### Níveis de Acesso

| Role | Acesso |
|---|---|
| `admin` | Acesso total: Approvals, System Liquidity, todos os endpoints |
| `merchant` | Dashboard operacional: Wallets, Swap, Payouts, Stores, Payment Links |
| `customer` | Acesso limitado: visualização de saldo e transacções próprias |

### Implementação

| Camada | Mecanismo | Descrição |
|---|---|---|
| **Frontend (Visual)** | Sidebar condicional | Secções admin ocultas para não-admins |
| **Backend (Real)** | `requireRole('admin')` | Middleware que valida role no JWT |
| **Resposta** | `403 Forbidden` | Não-admins que chamam endpoints admin recebem 403 |

### Secções Protegidas (Admin-only)

- **Aprovações** — `GET /action-tickets`, `POST /action-tickets/:id/approve`
- **Liquidez do Sistema** — `GET /admin/payouts/pending`, dados agregados

O frontend esconde visualmente estas secções, mas a segurança real é garantida pelo backend middleware.

---

## 9. Design System

### 9.1 Color Palette (NeXFlowX Institutional Fintech Theme)

| Token | Cor | Hex | Uso |
|---|---|---|---|
| `--background` | Midnight | `#0F1117` | Fundo principal |
| `--foreground` | White | `#FFFFFF` | Texto principal |
| `--card` | Carbon | `#14171E` | Fundo de cards |
| `--primary` | Neon Teal | `#00D4AA` | Acentuação principal |
| `--secondary` | Slate | `#1A1F2A` | Fundo secundário |
| `--muted-foreground` | Silver | `#A0A0A0` | Texto secundário |
| `--accent` | Teal Ghost | `rgba(0,212,170,0.08)` | Hover states |
| `--destructive` | Signal Red | `#FF5252` | Erros, alertas |
| `--border` | Border | `#1E222C` | Bordas |
| `--ring` | Neon Teal | `#00D4AA` | Focus rings |
| `--chart-1` | Neon Teal | `#00D4AA` | Gráficos — primário |
| `--chart-2` | Cyan | `#00B4D8` | Gráficos — secundário |
| `--chart-3` | Amber | `#FFB800` | Gráficos — terciário |
| `--chart-4` | Purple | `#A855F7` | Gráficos — quaternário |
| `--chart-5` | Red | `#FF5252` | Gráficos — quaternário |
| `--sidebar` | Deep Midnight | `#0C0E14` | Fundo da sidebar |

### 9.2 Typography

| Elemento | Font | Uso |
|---|---|---|
| **Sans** | `Geist Sans` | Texto geral, UI |
| **Mono** | `Geist Mono` | Dados financeiros, código, badges |

Classe utilitária: `.nex-mono` aplica `font-family: var(--font-geist-mono)`.

### 9.3 CSS Classes — Design System

| Classe | Efeito |
|---|---|
| `.glass-panel` | Glassmorphism: blur 24px, border `#1E222C`, hover glow teal |
| `.neon-glow` | Text-shadow teal (7px + 20px) |
| `.neon-glow-red` | Text-shadow red |
| `.neon-glow-amber` | Text-shadow amber |
| `.neon-glow-cyan` | Text-shadow cyan |
| `.neon-glow-purple` | Text-shadow purple |
| `.glow-box` | Box-shadow teal (30px + 60px) |
| `.glow-box-subtle` | Box-shadow teal subtle (20px) |
| `.glow-breathe` | Animação breathing glow (3s infinite) |
| `.neon-pulse` | Animação pulse opacity (2s infinite) |
| `.neon-btn-primary` | Botão com gradiente teal, border, hover glow |
| `.neon-input` | Input com border `#1E222C`, focus glow teal |
| `.neon-sidebar` | Sidebar com blur 24px, border-right |
| `.neon-sidebar-link` | Link sidebar: cor `#A0A0A0`, hover teal |
| `.neon-sidebar-link.active` | Link activo: cor `#00D4AA`, border-left teal |
| `.neon-badge-teal` | Badge: bg teal 8%, border teal 25% |
| `.neon-badge-red` | Badge: bg red 8%, border red 25% |
| `.neon-badge-amber` | Badge: bg amber 8%, border amber 25% |
| `.neon-badge-cyan` | Badge: bg cyan 8%, border cyan 25% |
| `.neon-badge-purple` | Badge: bg purple 8%, border purple 25% |
| `.neon-progress-bar` | Barra de progresso com scanlines |
| `.neon-progress-fill.teal` | Fill gradiente teal com glow |
| `.neon-progress-fill.red` | Fill gradiente red com glow |
| `.neon-progress-fill.amber` | Fill gradiente amber com glow |
| `.logo-3d` | Logo com 3D depth shadows + teal glow ring |
| `.logo-spin` | Rotação 3D do logo (8s ease-in-out) |
| `.status-dot.active` | Dot verde com glow teal |
| `.status-dot.warning` | Dot amber com glow |
| `.status-dot.error` | Dot vermelho com glow |
| `.hover-lift` | Hover: translateY(-2px) + shadow |
| `.cyber-grid-bg` | Grid de fundo com linhas teal |
| `.cyber-scrollbar` | Scrollbar custom (5px, teal) |
| `.dev-badge` | Badge DEV com pulse amber |
| `.scan-line-effect` | Linha de scan animada |
| `.animate-fade-up` | Entrada: fade + slide up (0.5s) |
| `.animate-fade-up-{1..4}` | Entrada escalonada com delays 0.1s–0.4s |

### 9.4 Animações

| Nome | Duração | Descrição |
|---|---|---|
| `neon-pulse` | 2s | Pulsação de opacidade |
| `glow-breathe` | 3s | Respiração do glow na box-shadow |
| `logo-ring-spin` | 6s | Rotação contínua do anel do logo |
| `logo-rotate` | 8s | Rotação 3D do logo (rotateY ±3deg) |
| `scan-line` | 8s | Linha de scan vertical |
| `dev-badge-pulse` | 3s | Pulsação do badge DEV |
| `fadeSlideUp` | 0.5s | Entrada fade + slide up |

---

## 10. Componentes Dashboard (13 Secções)

| # | Secção | ID | Componente | Grupo | Icon | Admin |
|---|---|---|---|---|---|---|
| 1 | **Dashboard** | `dashboard` | `DashboardOverview` | Operação | `LayoutDashboard` | — |
| 2 | **Tesouraria / Wallets** | `wallets` | `WalletCards` | Operação | `Landmark` | — |
| 3 | **Transações** | `activity` | `FinancialActivityTable` | Operação | `ReceiptText` | — |
| 4 | **Lojas & Marcas** | `stores` | `StoresPanel` | Operação | `Store` | — |
| 5 | **Links de Pagamento** | `payment-links` | `PaymentLinksPanel` | Operação | `Link2` | — |
| 6 | **Gateways & API** | `gateways` | `GatewaysPanel` | Operação | `Plug` | — |
| 7 | **Swap FX** | `swap` | `SwapWidget` | Operação (Widget) | `ArrowLeftRight` | — |
| 8 | **Payouts** | `payouts` | `PayoutWidget` | Operação (Widget) | `Send` | — |
| 9 | **Depósitos** | `deposits` | `DepositWidget` | Operação (Widget) | `Download` | — |
| 10 | **Aprovações** | `approvals` | `AdminApprovalTable` | Administração | `ShieldCheck` | ✅ |
| 11 | **Liquidez do Sistema** | `liquidity` | `SystemLiquidityPanel` | Administração | `Droplets` | ✅ |
| 12 | **Developer / API** | `developer` | `ApiManagement` | Sistema | `Code2` | — |
| 13 | **Definições** | `settings` | `SettingsSecurity` | Sistema | `Settings` | — |

### Componentes Auxiliares

| Componente | Ficheiro | Descrição |
|---|---|---|
| `DashboardShell` | `dashboard-shell.tsx` | Layout principal: sidebar + header + área de conteúdo |
| `Sidebar` | `sidebar.tsx` | Navegação lateral (desktop fixa + mobile drawer Sheet) |
| `Header` | `header.tsx` | Barra superior com info do utilizador |
| `LoginPage` | `login-page.tsx` | Página de autenticação |
| `MetricCard` | `metric-card.tsx` | Card de KPI com valor, label e tendência |
| `GlassCard` | `glass-card.tsx` | Wrapper glassmorphism reutilizável |
| `GlowWrapper` | `glow-wrapper.tsx` | Wrapper com efeito neon glow |
| `NeonChart` | `neon-chart.tsx` | Wrapper Recharts com tema neon |
| `WorldMapNetwork` | `world-map-network.tsx` | Mapa global de rede (d3-geo + topojson) |
| `Logo3D` | `ui/logo-3d.tsx` | Logo 3D com anel rotativo e efeito glow |

---

## 11. Segurança

| Camada | Mecanismo | Detalhes |
|---|---|---|
| **Transporte** | TLS 1.3 | Encriptação em trânsito para todas as comunicações |
| **Dados em Repouso** | AES-256-GCM | Encriptação de dados sensíveis |
| **Modelo** | Non-Custodial Orchestration | A plataforma nunca tem custódia directa dos fundos |
| **Autenticação** | JWKS Asymmetric | Validação de JWT via chave pública assimétrica (Supabase) |
| **CORS** | Whitelisting | Apenas `https://wallet.atlasglobal.digital` |
| **Autorização** | RBAC | Role-based Access Control (admin, merchant, customer) |
| **Isolamento** | Zero DB Access | Frontend não acede directamente à base de dados de produção |
| **Tokens** | Bearer JWT | Access tokens com expiração, validação server-side |
| **Dev Bypass** | Env-controlled | Bypass desactivado automaticamente em produção |

### Modelo Non-Custodial

O Atlas Global Payments opera como **orquestrador não-custodial**: a plataforma encaminha e processa pagamentos, mas nunca toma posse directa dos fundos dos utilizadores. O settlement é feito em 3 estágios:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   INCOMING   │ →  │   PENDING    │ →  │  AVAILABLE   │
│  (A receber) │    │ (A liquidar) │    │  (Disponível) │
└──────────────┘    └──────────────┘    └──────────────┘
    balance_         balance_            balance_
    incoming         pending             available
```

---

## 12. Scripts & Deploy

### Comandos

```bash
# Desenvolvimento
bun dev                    # Inicia dev server na porta 3000

# Build de produção (standalone)
bun run build              # Build + copia static/public para standalone

# Produção
bun run start              # Executa standalone server

# Base de dados (dev)
bun run db:push            # Push schema para DB
bun run db:generate        # Gera Prisma client
bun run db:migrate         # Corre migrações
bun run db:reset           # Reset da DB

# Linting
bun run lint               # ESLint
```

### Deploy Architecture

```
Internet → Caddy (:81) → Next.js Standalone (:3000)
                          ├── Static assets (SSR)
                          ├── API Routes (minimal)
                          └── Client-side → NeXFlowX API
```

O Caddy actua como reverse proxy, encaminhando tráfego da porta 81 para o Next.js na porta 3000, com headers adequados (`X-Forwarded-For`, `X-Real-IP`, `X-Forwarded-Proto`).

---

## 13. Licença

```
IAHUB360 LTD — Proprietary License
UK Registration Number: 16626733

All rights reserved. Unauthorized copying, modification, distribution,
or use of this software, via any medium, is strictly prohibited without
the express written permission of IAHUB360 LTD.
```

---

<div align="center">

**Atlas Global Payments** · NeXFlowX™ Settlement Engine · IAHUB360 LTD

*Non-Custodial · Institutional · Real-Time*

</div>
