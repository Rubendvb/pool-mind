# Pool Mind — Contexto do Projeto

PWA de controle químico e manutenção de piscinas. Permite registrar medições dos parâmetros da água, receber diagnósticos automáticos com recomendações de dosagem de produtos, e gerenciar tarefas recorrentes de manutenção (piscina, jardim, casa).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 — App Router, Server Components, Server Actions |
| Linguagem | TypeScript (strict) |
| Estilo | Tailwind CSS v4 — CSS-first com `@theme` |
| Banco | Supabase (PostgreSQL) com Row Level Security |
| Auth | Supabase Auth — e-mail/senha com callback em `/auth/callback` |
| Deploy | — (não configurado ainda) |

---

## Variáveis de Ambiente

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # usado no emailRedirectTo do signup
```

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── layout.tsx                  # Root layout (sem BottomNav)
│   ├── globals.css                 # Tema: paleta ocean-*, status-*, glassmorphism
│   ├── middleware.ts               # Protege todas as rotas; redireciona para /login
│   ├── auth/callback/route.ts      # Troca code por sessão após confirmação de e-mail
│   ├── login/
│   │   ├── page.tsx                # Página pública de login/cadastro
│   │   ├── LoginForm.tsx           # Client Component com toggle login/signup
│   │   └── actions.ts              # signInWithEmail, signUpWithEmail, signOut
│   └── (app)/                      # Route group — rotas protegidas com BottomNav
│       ├── layout.tsx              # Injeta <BottomNav />
│       ├── loading.tsx             # Skeleton do dashboard
│       ├── page.tsx                # Dashboard (Suspense streaming)
│       ├── actions.ts              # createPool (Server Action)
│       ├── medicoes/
│       │   ├── page.tsx            # Histórico de medições
│       │   ├── loading.tsx
│       │   └── actions.ts          # addMeasurement
│       └── tarefas/
│           ├── page.tsx            # Lista de tarefas por categoria
│           ├── loading.tsx
│           └── actions.ts          # addTask, completeTask
│
├── components/
│   ├── ui/
│   │   ├── Modal.tsx               # Bottom-sheet modal centralizado, z-[60]
│   │   ├── ParameterCard.tsx       # Card de parâmetro com barra de progresso
│   │   ├── Skeleton.tsx            # DashboardSkeleton, ListSkeleton
│   │   └── StatusBadge.tsx         # <StatusBadge> e <StatusDot> por ParameterStatus
│   ├── layout/
│   │   ├── BottomNav.tsx           # Nav fixa com links + LogoutButton
│   │   ├── Header.tsx              # Título + subtítulo + action slot
│   │   └── LogoutButton.tsx        # Chama signOut via form action
│   ├── dashboard/
│   │   ├── ChemicalSection.tsx     # Server Component — busca última medição e renderiza parâmetros + dosagens
│   │   ├── TasksPreview.tsx        # Server Component — busca tarefas urgentes
│   │   ├── CreatePoolForm.tsx      # Client Component — onboarding de nova piscina
│   │   ├── DosageCard.tsx          # Lista de recomendações de correção
│   │   └── OverallStatusCard.tsx   # Status geral da água (ok/warning/danger/unknown)
│   ├── measurements/
│   │   └── NewMeasurementButton.tsx  # Client Component — abre Modal com formulário
│   └── tasks/
│       ├── TaskItem.tsx            # Item de tarefa com CompleteTaskButton
│       ├── CompleteTaskButton.tsx  # Client Component — chama completeTask
│       └── NewTaskButton.tsx       # Client Component — abre Modal com formulário
│
├── lib/
│   ├── chemistry.ts                # buildParameters(), calcDosages(), overallStatus()
│   ├── mocks.ts                    # Dados falsos (não usados em produção, úteis para testes)
│   └── supabase/
│       ├── client.ts               # createBrowserClient — uso em Client Components
│       ├── server.ts               # createServerClient com cookies — uso em Server Components
│       ├── queries.ts              # getPool, getMeasurements, getTasks (com React cache())
│       └── types.ts                # Tipos TypeScript do schema (Database)
│
└── types/
    └── index.ts                    # Pool, Measurement, Task, ChemicalParameter, DosageRecommendation
```

---

## Banco de Dados (Supabase)

### Tabelas

**`pools`** — uma por usuário (por ora)
- `id`, `user_id`, `name`, `volume` (litros), `type` (vinil/fibra/alvenaria), `created_at`

**`measurements`**
- `id`, `pool_id`, `ph`, `chlorine`, `alkalinity`, `hardness` (nullable), `notes`, `image_url`, `measured_at`

**`tasks`**
- `id`, `user_id`, `title`, `category` (piscina/casa/jardim), `frequency` (diaria/semanal/quinzenal/mensal), `next_due` (date), `status` (pendente/concluida/atrasada), `created_at`

### RLS
Todas as tabelas têm RLS ativo. Cada usuário só acessa os próprios dados.

### Trigger
`trg_advance_task_due` — ao marcar uma tarefa como `concluida`, recalcula `next_due` e redefine `status = 'pendente'` automaticamente.

### Migrations
- `supabase/migrations/001_initial_schema.sql` — schema completo + RLS + trigger
- `supabase/migrations/002_hardness_nullable.sql` — torna `hardness` nullable

---

## Lógica Química (`src/lib/chemistry.ts`)

Faixas ideais:
- pH: 7.2 – 7.6
- Cloro livre: 1.0 – 3.0 mg/L
- Alcalinidade: 80 – 120 mg/L
- Dureza: 200 – 400 mg/L

Status por parâmetro: `ok` / `warning` (±25% da faixa) / `danger` / `unknown` (valor null).

Dosagens calculadas por volume da piscina:
- pH baixo → pH+ (Barrilha) em gramas
- pH alto → pH- (Ácido Muriático) em ml
- Cloro baixo → Triclorado 90% em gramas
- Alcalinidade baixa → Bicarbonato de Sódio em gramas

---

## Padrões e Convenções

**Server vs Client:**
- Páginas são Server Components assíncronos por padrão
- Só usar `"use client"` quando há estado, eventos ou hooks do browser
- Server Actions ficam em `actions.ts` junto da página que as usa

**Queries:**
- Sempre via `src/lib/supabase/queries.ts`
- Funções de leitura usam `cache()` do React para deduplicação por request
- Mutações (insert/update) chamam `revalidatePath()` para invalidar o cache

**Tailwind v4:**
- Cores customizadas definidas em `globals.css` com `@theme { --color-ocean-* }`
- Classes utilitárias: `.glass` e `.glass-strong` para glassmorphism
- Não há `tailwind.config.js` — configuração é toda via CSS

**Tipos:**
- Tipos da app em `src/types/index.ts` (snake_case, alinhados com o schema do banco)
- Tipos gerados do Supabase em `src/lib/supabase/types.ts` (mantidos manualmente)

---

## O que está pendente (TODO.md)

- [ ] Gráficos de evolução dos parâmetros ao longo do tempo
- [ ] PWA: manifest, service worker, ícones
- [ ] Fase 5: relatórios de consumo, notificações push
- [ ] Testes unitários para `chemistry.ts`
