# Pool Mind

![CI](https://github.com/Rubendvb/pool-mind/actions/workflows/ci.yml/badge.svg)

PWA de controle químico e manutenção de piscinas. Registre medições, receba diagnósticos automáticos com dosagens calculadas por volume e gerencie tarefas recorrentes de manutenção.

---

## Funcionalidades

- **Dashboard** — status geral da água com cards de parâmetros (pH, cloro, alcalinidade, dureza), recomendações de correção com botão de aplicação de dosagem, prévia das próximas tarefas e editor de volume da piscina
- **Produtos** — gestão do inventário de produtos químicos, com controle de estoque, categoria, validade, regras de dosagem personalizada e atributos ativos
- **Calculadoras e Utilitários** — central de ferramentas: cálculo exato de volume, simulador de dosagem rápida, conversão de medidas e regra de três simples e composta (com abas)
- **Medições** — histórico completo com formulário de registro e exclusão; campo de dureza opcional
- **Tarefas** — checklist por categoria (piscina, jardim, casa) com frequência recorrente; ao concluir, o banco recalcula automaticamente a próxima data via trigger
- **Insights** — gráficos de evolução dos parâmetros, relatório de aplicações de produtos com custo em R$, relatório de consumo estimado e configuração de notificações push
- **Autenticação** — login e cadastro por e-mail/senha com confirmação; sessão gerenciada via cookie
- **PWA** — instalável no celular, com service worker e manifest configurados

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 — App Router, Server Components, Server Actions |
| Linguagem | TypeScript 5 (strict) |
| Estilo | Tailwind CSS v4 — configuração CSS-first com `@theme` |
| Banco | Supabase (PostgreSQL) com Row Level Security |
| Auth | Supabase Auth — e-mail/senha |
| Gráficos | Recharts |
| Push | Web Push API + VAPID |
| Testes | Vitest |

---

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)

---

## Instalação

```bash
git clone <repo>
cd pool-mind
npm install
```

### Variáveis de ambiente

Copie o arquivo de exemplo e preencha com seus valores:

```bash
cp .env.example .env.local
```

Todas as variáveis estão documentadas em `.env.example` com instruções para cada uma.

Para gerar as chaves VAPID:

```bash
node -e "const wp=require('web-push'); const k=wp.generateVAPIDKeys(); console.log(k)"
```

### Banco de dados

Execute os arquivos de migração no **SQL Editor** do Supabase, em ordem:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_hardness_nullable.sql
supabase/migrations/003_push_subscriptions.sql
supabase/migrations/004_products.sql
supabase/migrations/005_product_dosage.sql
supabase/migrations/006_financial.sql
```

Em seguida, vá em **Authentication → URL Configuration** e adicione às Redirect URLs:

```
http://localhost:3000/auth/callback
```

---

## Rodando localmente

```bash
npm run dev
```

Acesse `http://localhost:3000`.

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Servidor de produção |
| `npm test` | Executa os testes (Vitest) |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Relatório de cobertura |
| `npm run lint` | ESLint |

---

## Estrutura de pastas

```
src/
├── app/
│   ├── layout.tsx                  # Root layout — registra o service worker
│   ├── globals.css                 # Tema, paleta ocean-*, glassmorphism
│   ├── middleware.ts               # Proteção de rotas; redireciona para /login
│   ├── auth/callback/route.ts      # Callback de confirmação de e-mail
│   ├── login/                      # Página pública de autenticação
│   ├── api/push/                   # API de push notifications
│   │   ├── subscribe/route.ts      # Salva/remove subscription
│   │   └── notify/route.ts         # Dispara notificações pendentes
│   └── (app)/                      # Rotas protegidas (requer sessão)
│       ├── layout.tsx              # Injeta BottomNav
│       ├── page.tsx                # Dashboard com Suspense streaming
│       ├── produtos/               # Gestão do inventário químico
│       ├── calculadoras/           # Central de ferramentas e utilitários
│       ├── medicoes/               # Histórico e registro de medições
│       ├── tarefas/                # Lista e gestão de tarefas
│       └── insights/               # Gráficos, custos e notificações
│
├── components/
│   ├── ui/                         # Modal, ParameterCard, StatusBadge, Skeleton, CurrencyInput
│   ├── layout/                     # BottomNav, Header, LogoutButton
│   ├── dashboard/                  # ChemicalSection, TasksPreview, DosageCard, CreatePoolForm, ApplyDosageButton, VolumeEditor
│   ├── measurements/               # NewMeasurementButton, DeleteMeasurementButton
│   ├── products/                   # ProductItem, ProductFormButton, DeleteProductButton, ToggleProductButton
│   ├── calculators/                # PoolVolumeCalculator, ConverterCalculator, DosageSandbox, RuleOfThreeCalculator, CompoundRuleOfThreeCalculator, RuleOfThreeTabs
│   ├── tasks/                      # TaskItem, NewTaskButton, CompleteTaskButton
│   ├── insights/                   # ParameterChart, ParameterChartClient, CostReport, ApplicationsReport
│   ├── push/                       # NotificationSetup
│   └── pwa/                        # ServiceWorkerRegister
│
├── lib/
│   ├── chemistry.ts                # buildParameters, calcDosages, overallStatus
│   ├── currency.ts                 # Formatação de moeda (BRL)
│   ├── finance.ts                  # Cálculos de custo de aplicações de produtos
│   ├── mocks.ts                    # Dados estáticos para desenvolvimento
│   ├── calculators/
│   │   └── volume.ts               # Cálculo de volume de piscina por formato
│   ├── __tests__/
│   │   └── chemistry.test.ts       # Testes unitários (Vitest)
│   └── supabase/
│       ├── client.ts               # createBrowserClient (Client Components)
│       ├── server.ts               # createServerClient com cookies (Server Components)
│       ├── queries.ts              # Queries com React cache()
│       └── types.ts                # Tipos TypeScript do schema
│
└── types/
    └── index.ts                    # Pool, Measurement, Task, ChemicalParameter, DosageRecommendation
```

---

## Regras de negócio

### Parâmetros químicos

| Parâmetro | Faixa ideal | Unidade |
|---|---|---|
| pH | 7.2 – 7.6 | — |
| Cloro livre | 1.0 – 3.0 | mg/L |
| Alcalinidade | 80 – 120 | mg/L |
| Dureza | 200 – 400 | mg/L (opcional) |

**Status:** `ok` dentro da faixa; `warning` dentro de ±25% da amplitude; `danger` fora desse limite. Dureza `null` → `unknown`. Status geral: `danger` > `warning` > `ok`.

### Dosagens

Calculadas em `src/lib/chemistry.ts` proporcionalmente ao volume:

| Problema | Produto | Referência |
|---|---|---|
| pH baixo | pH+ Barrilha | 20g / 10.000L por 0,2 de delta |
| pH alto | pH− Ácido Muriático | 20ml / 10.000L por 0,2 de delta |
| Cloro baixo | Triclorado 90% | 10g / 10.000L por 0,5 mg/L |
| Alcalinidade baixa | Bicarbonato de Sódio | 15g / 10.000L por 10 mg/L |

Prioridade `urgent`: delta de pH > 0,4; cloro < 0,5 mg/L ou > 5 mg/L.

> **Nota de Evolução:** As fórmulas descritas acima são **genéricas** (fallback). A plataforma está migrando para **Dosagem Personalizada** baseada no inventário real do usuário (Fase 2 do [ROADMAP.md](./ROADMAP.md)), onde cada cálculo de correção utilizará a concentração e a regra estipulada em cada produto cadastrado.

### Recorrência de tarefas

O trigger `trg_advance_task_due` recalcula `next_due` e redefine `status = 'pendente'` automaticamente ao marcar uma tarefa como `concluida`. Tarefas com `next_due < hoje` são marcadas `atrasada` em memória na query `getTasks()`.

### Notificações push

`POST /api/push/notify` verifica, para o usuário autenticado: tarefas com `next_due <= hoje` e última medição há ≥ 7 dias. Requer subscriptions salvas via `POST /api/push/subscribe`.

---

## Padrões do projeto

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Lint com ESLint |
| `npm test` | Testes unitários com Vitest |
| `npm run test:coverage` | Testes com relatório de cobertura |
| `npm run gen:types` | Regenera `src/lib/supabase/types.ts` a partir do schema local do Supabase |

> **Importante:** Execute `npm run gen:types` sempre que alterar o schema do banco (migrations). Requer o CLI do Supabase instalado e o projeto rodando localmente (`supabase start`).

---

## Padrões do projeto

**Server vs. Client Components:** páginas são Server Components assíncronos; `"use client"` apenas para estado ou eventos do browser; Server Actions ficam em `actions.ts` junto da rota.

**Cache:** funções de leitura usam `cache()` do React para deduplicação por request; mutações chamam `revalidatePath()`; dashboard usa Suspense para streaming paralelo.

**Tailwind v4:** sem `tailwind.config.js`; configuração via `@theme` em `globals.css`; classes utilitárias `.glass`, `.glass-strong` e `.nav-bar`.

**Tipos:** `src/types/index.ts` para tipos da aplicação (snake_case, alinhados com o banco); `src/lib/supabase/types.ts` para o schema do Supabase (mantidos manualmente).
