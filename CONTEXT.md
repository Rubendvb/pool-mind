# Pool Mind — Context

PWA pessoal de controle químico e manutenção de piscinas. O usuário registra medições dos parâmetros da água, recebe diagnóstico automático com recomendações de dosagem calculadas pelo volume da piscina, e gerencia tarefas recorrentes de manutenção (piscina, jardim, casa).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 — App Router, Server Components, Server Actions |
| Linguagem | TypeScript 5 (strict) |
| Estilo | Tailwind CSS v4 — CSS-first, `@theme` em `globals.css`, sem `tailwind.config.js` |
| Banco | Supabase (PostgreSQL) com Row Level Security |
| Auth | Supabase Auth — e-mail/senha, callback em `/auth/callback` |
| Gráficos | Recharts (lazy-loaded via `next/dynamic` em Client Component) |
| Push | Web Push API + VAPID (`web-push`) |
| Testes | Vitest |

---

## Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Estrutura de Arquivos

```
src/
├── app/
│   ├── layout.tsx                  # Root layout — sem BottomNav; monta ServiceWorkerRegister
│   ├── globals.css                 # Paleta ocean-*, status-*, .glass, .glass-strong, .nav-bar
│   ├── middleware.ts               # Protege todas as rotas; redireciona /login se sem sessão
│   ├── auth/callback/route.ts      # Troca code por sessão após confirmação de e-mail
│   ├── login/
│   │   ├── page.tsx                # Página pública
│   │   ├── LoginForm.tsx           # Client Component — toggle login/signup
│   │   └── actions.ts              # signInWithEmail, signUpWithEmail, signOut
│   ├── api/push/
│   │   ├── subscribe/route.ts      # POST salva subscription; DELETE remove
│   │   └── notify/route.ts         # POST verifica tarefas/medições e envia push
│   └── (app)/                      # Route group — requer sessão; tem BottomNav
│       ├── layout.tsx              # Injeta <BottomNav />
│       ├── loading.tsx             # DashboardSkeleton
│       ├── page.tsx                # Dashboard — Suspense com ChemicalSection + TasksPreview
│       ├── actions.ts              # createPool (Server Action)
│       ├── medicoes/
│       │   ├── page.tsx            # Histórico (Server Component async)
│       │   ├── loading.tsx
│       │   └── actions.ts          # addMeasurement
│       ├── tarefas/
│       │   ├── page.tsx            # Lista por categoria (Server Component async)
│       │   ├── loading.tsx
│       │   └── actions.ts          # addTask, completeTask
│       ├── produtos/
│       │   ├── page.tsx            # Gestão do inventário (Server Component async)
│       │   ├── loading.tsx
│       │   └── actions.ts          # addProduct, updateProduct, deleteProduct, toggleProductActive
│       └── insights/
│           ├── page.tsx            # Resumo, gráficos, custos, notificações
│           └── loading.tsx
│
├── components/
│   ├── ui/
│   │   ├── Modal.tsx               # Centralizado, z-[60], scrollável, fecha com Esc
│   │   ├── ParameterCard.tsx       # Card com barra de progresso relativa ao ideal
│   │   ├── Skeleton.tsx            # DashboardSkeleton, ListSkeleton
│   │   └── StatusBadge.tsx         # <StatusBadge> e <StatusDot> por ParameterStatus
│   ├── layout/
│   │   ├── BottomNav.tsx           # 4 abas: Dashboard, Medições, Tarefas, Insights
│   │   ├── Header.tsx              # title + subtitle + action slot
│   │   └── LogoutButton.tsx        # form action → signOut
│   ├── dashboard/
│   │   ├── ChemicalSection.tsx     # Server Component — última medição + parâmetros + dosagens
│   │   ├── TasksPreview.tsx        # Server Component — 3 tarefas mais urgentes
│   │   ├── CreatePoolForm.tsx      # Client Component — onboarding de nova piscina
│   │   ├── DosageCard.tsx          # Lista de recomendações com prioridade
│   │   └── OverallStatusCard.tsx   # Banner de status geral (ok/warning/danger/unknown)
│   ├── measurements/
│   │   └── NewMeasurementButton.tsx  # Abre Modal com form; chama addMeasurement
│   ├── tasks/
│   │   ├── TaskItem.tsx            # Item com ícone por categoria + CompleteTaskButton
│   │   ├── CompleteTaskButton.tsx  # Chama completeTask; spinner durante pending
│   │   └── NewTaskButton.tsx       # Abre Modal com form; chama addTask
│   ├── products/
│   │   ├── ProductItem.tsx         # Item da lista com status badge
│   │   ├── ProductFormButton.tsx   # Modal de criação/edição
│   │   ├── DeleteProductButton.tsx # Exclusão com confirmação
│   │   └── ToggleProductButton.tsx # Alternar ativo/inativo
│   ├── insights/
│   │   ├── ParameterChart.tsx      # Recharts LineChart (Client Component puro)
│   │   ├── ParameterChartClient.tsx  # Wrapper com next/dynamic ssr:false
│   │   └── CostReport.tsx          # Calcula custo estimado a partir do histórico
│   ├── push/
│   │   └── NotificationSetup.tsx   # Solicita permissão; salva/remove subscription
│   └── pwa/
│       └── ServiceWorkerRegister.tsx  # Registra /sw.js no useEffect (montado no root layout)
│
├── lib/
│   ├── chemistry.ts                # buildParameters(), calcDosages(), overallStatus()
│   ├── mocks.ts                    # Dados estáticos — não usados em produção
│   └── supabase/
│       ├── client.ts               # createBrowserClient<Database> — Client Components
│       ├── server.ts               # createServerClient<Database> com cookies — Server Components
│       ├── queries.ts              # Leituras com cache(); mutações com revalidatePath()
│       └── types.ts                # Database interface completa (mantida manualmente)
│
├── types/
│   └── index.ts                    # Pool, Measurement, Task, ChemicalParameter, DosageRecommendation
│
└── middleware.ts                   # Fora de src/app — intercepta todas as rotas
```

---

## Banco de Dados

### Tabelas

**`pools`**
```
id uuid PK | user_id uuid FK auth.users | name text | volume integer | type enum | created_at
```

**`measurements`**
```
id uuid PK | pool_id uuid FK pools | ph numeric(4,2) | chlorine numeric(5,2) | alkalinity integer
hardness integer NULL | notes text NULL | image_url text NULL | measured_at timestamptz
```

**`tasks`**
```
id uuid PK | user_id uuid FK auth.users | title text | category enum | frequency enum
next_due date | status enum | created_at
```

**`push_subscriptions`**
```
id uuid PK | user_id uuid FK auth.users | endpoint text UNIQUE | p256dh text | auth text | created_at
```

**`products`**
```
id uuid PK | user_id uuid FK auth.users | name text | category text | manufacturer text | concentration numeric(5,2)
unit text | quantity numeric(10,2) | expiration_date date | notes text | is_active boolean | created_at
dosage_reference_amount numeric(10,3) | dosage_reference_liters numeric(10,2) | dosage_effect_value numeric(10,4) | dosage_effect_type text
price numeric(10,2) | price_unit text | package_quantity numeric(10,3)
```

**`product_applications`**
```
id uuid PK | user_id uuid FK auth.users | product_id uuid FK products | product_name text | measurement_id uuid FK measurements
quantity_used numeric(10,3) | unit text | cost numeric(10,4) | applied_at timestamptz | notes text | created_at
```

### RLS
Todas as tabelas têm RLS ativo. Cada usuário acessa somente seus próprios dados. Measurements são acessíveis via join com pools do mesmo usuário.

### Funções e Triggers
- `trg_advance_task_due` — `BEFORE UPDATE` em `tasks`: quando `status` muda para `concluida`, recalcula `next_due` conforme a frequência e redefine `status = 'pendente'`.
- `apply_product_usage` — RPC (Stored Procedure): valida posse do produto, verifica e debita estoque (se tracked) e insere log imutável na tabela `product_applications` de forma atômica e segura.

### Migrations
```
supabase/migrations/001_initial_schema.sql   # Schema completo + RLS + trigger
supabase/migrations/002_hardness_nullable.sql  # hardness DROP NOT NULL
supabase/migrations/003_push_subscriptions.sql # Tabela de push subscriptions
supabase/migrations/004_products.sql           # Tabela products de estoque
supabase/migrations/005_product_dosage.sql     # Regras de dosagem personalizada (Fase 2)
supabase/migrations/006_financial.sql          # Preços e log de aplicações (Fase 3)
```

---

## Lógica Química

Arquivo: `src/lib/chemistry.ts`

### Faixas ideais
```typescript
ph:         { min: 7.2, max: 7.6 }
chlorine:   { min: 1.0, max: 3.0 }  // mg/L
alkalinity: { min: 80,  max: 120 }  // mg/L
hardness:   { min: 200, max: 400 }  // mg/L
```

### Status por parâmetro
- `ok` — dentro da faixa ideal
- `warning` — dentro de ±25% da amplitude da faixa
- `danger` — fora do intervalo de tolerância
- `unknown` — valor `null` (apenas hardness)

### Dosagens por produto
| Produto | Gatilho | Fórmula |
|---|---|---|
| pH+ (Barrilha) | ph < 7.2 | `ceil((delta/0.2) * 20 * (vol/10000))` g |
| pH− (Ácido Muriático) | ph > 7.6 | `ceil((delta/0.2) * 20 * (vol/10000))` ml |
| Triclorado 90% | chlorine < 1.0 | `ceil((delta/0.5) * 10 * (vol/10000))` g |
| Bicarbonato de Sódio | alkalinity < 80 | `ceil((delta/10) * 15 * (vol/10000))` g |

Prioridade `urgent`: delta pH > 0.4; cloro < 0.5 ou > 5 mg/L.

---

## Fluxos Principais

### Login / Cadastro
1. Usuário acessa qualquer rota → middleware verifica sessão → redireciona `/login` se ausente
2. Cadastro: `signUpWithEmail` envia e-mail de confirmação com `emailRedirectTo` apontando para `/auth/callback`
3. Confirmação: `/auth/callback/route.ts` troca o `code` por sessão e redireciona para `/`
4. Login direto: `signInWithPassword` → redirect `/`

### Primeira vez (onboarding)
1. Usuário logado sem pool → dashboard mostra `CreatePoolForm`
2. Pool criado → `revalidatePath('/')` → dashboard carrega normalmente com estado vazio

### Registrar medição
1. Botão "+ Nova" na página Medições → abre `Modal`
2. Formulário com pH, cloro, alcalinidade obrigatórios; dureza opcional
3. Submit → Server Action `addMeasurement` → insert no Supabase → `revalidatePath('/medicoes')` e `revalidatePath('/')`
4. Modal fecha, lista atualiza, dashboard reflete nova medição

### Concluir tarefa
1. Botão `✓` em qualquer `TaskItem` → Client Component `CompleteTaskButton`
2. Chama Server Action `completeTask(taskId)` → `UPDATE status = 'concluida'`
3. Trigger do banco recalcula `next_due` e redefine `status = 'pendente'`
4. `revalidatePath('/tarefas')` e `revalidatePath('/')` → UI atualiza

### Push Notifications
1. Página Insights → `NotificationSetup` → solicita permissão do browser
2. Se concedida → `reg.pushManager.subscribe()` com VAPID público → `POST /api/push/subscribe`
3. Subscription salva em `push_subscriptions`
4. `POST /api/push/notify` (chamado manualmente ou via cron) → verifica tarefas atrasadas e medições vencidas → envia push via `web-push`
5. Service worker (`/sw.js`) exibe a notificação; ao clicar, abre a rota correspondente

---

## Padrões e Convenções

### Server vs Client
- Páginas: Server Components assíncronos (`async function Page()`)
- Formulários com estado: Client Components que chamam Server Actions
- Server Actions em `actions.ts` na pasta da rota que as usa
- Nunca chamar `createClient()` do browser em código server-side

### Queries
- `getPool`, `getMeasurements`, `getTasks` — wrappadas em `cache()` do React para deduplicação no mesmo request
- Mutações (`insert`, `update`) não usam cache; sempre chamam `revalidatePath()`
- Dashboard usa `Promise.all` via Suspense para paralelizar `ChemicalSection` e `TasksPreview`

### Componentes
- Modais: sempre usar `<Modal>` de `src/components/ui/Modal.tsx` (z-[60], acima do nav)
- Status visual: sempre usar `<StatusBadge>` ou `<StatusDot>` de `StatusBadge.tsx`
- Skeletons: `DashboardSkeleton` para `/`, `ListSkeleton` para listas

### Tailwind v4
- Cores customizadas definidas em `globals.css` → `@theme { --color-ocean-* }`
- Classes CSS customizadas (`.glass`, `.glass-strong`, `.nav-bar`) também em `globals.css`
- Não criar `tailwind.config.js`

### Tipos
- Sempre manter `src/lib/supabase/types.ts` sincronizado com as migrations
- Campos nullable no banco → `T | null` nos tipos TypeScript
- Tipos da aplicação em `src/types/index.ts` usam snake_case para alinhar com o banco

---

## Limitações Conhecidas

- **Um pool por usuário** — `getPool()` busca o primeiro por `created_at`; não há suporte a múltiplas piscinas
- **Custo estimado** — calculado retrospectivamente das medições; não rastreia aplicações reais de produto
- **Ícones PWA** — gerados programaticamente com fundo gradiente e letra "P"; substituir por design profissional
- **Notificações** — o endpoint `/api/push/notify` requer chamada manual ou cron externo; não há agendamento interno
- **Dureza** — parâmetro opcional; quando `null`, não gera recomendações de correção

---

## Evolução do Projeto

Para informações completas de evolução técnica, visão de produto, e roadmap estruturado contendo a integração de cálculos químicos dinâmicos através dos produtos criados no inventário, consulte o documento **`ROADMAP.md`** na raiz do projeto.
