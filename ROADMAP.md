# Pool Mind — Roadmap Técnico e Funcional

## Visão geral do produto

Pool Mind é uma plataforma inteligente para controle químico e automação da manutenção de piscinas. Seu diferencial é abandonar cálculos genéricos e adotar cálculos reais baseados nos produtos específicos do usuário, com gestão financeira (custos reais de aplicação), automação e UX mobile-first (PWA).

## Estratégia de evolução

A evolução se dará em fases incrementais, priorizando:

1. **Modelagem de domínio (Produtos):** integrar estoque real aos cálculos.
2. **Inteligência química e financeira:** cálculos por produto, apuração de custos reais.
3. **Ferramentas utilitárias:** calculadoras de volume e dosagem rápida.
4. **Insights e automação:** relatórios avançados, alertas e integrações futuras.
5. **Estabilidade e polish:** fechar gaps de UX, bugs e qualidade antes de crescer.
6. **Features de retenção:** edição, alertas, notificações automáticas, exportação.
7. **Inteligência:** IA, tendências, Langelier, múltiplas piscinas.
8. **SaaS / Crescimento:** modo profissional B2B, OCR, gamificação, monetização.

Stack: **Next.js 16 (App Router), Server Actions, Supabase (RLS), TypeScript strict, Tailwind v4.**

---

## Roadmap por Fases

### ✅ Fase 1 — Produtos Inteligentes e Estoque

_Integrar o estoque de produtos físicos do usuário na plataforma._

- CRUD completo de produtos (tela `/produtos`)
- Atributos base: categoria química, concentração, validade, estoque, fabricante
- Ativar/Inativar produtos
- Tabela `products` com RLS restrito ao `user_id`

---

### ✅ Fase 2 — Dosagem Personalizada por Produto

_O grande diferencial técnico: cálculos baseados nas regras de cada produto._

- Campos de dosagem no produto: `dosage_reference_amount`, `dosage_reference_liters`, `dosage_effect_value`, `dosage_effect_type`
- `calcDosages` utiliza fórmula real do produto; fallback genérico com ajuste por concentração
- Resultados precisos: "Adicione 48g do seu Cloro HTH 90%"

---

### ✅ Fase 3 — Inteligência Financeira e Consumo

_Transformar dados químicos em inteligência financeira._

- Atributos de preço nos produtos: `price`, `price_unit`, `package_quantity`
- Tabela `product_applications` (log imutável)
- RPC `apply_product_usage`: valida posse, debita estoque e insere log atomicamente
- `ApplyDosageButton` na dashboard para registrar aplicação com custo calculado
- `ApplicationsReport` em Insights com histórico real de aplicações e total gasto

---

### ✅ Fase 4 — Calculadoras e Utilitários

_Ferramentas essenciais para o dia a dia sem sair do app._

- `/calculadoras/piscina`: volume para retangular, redonda e oval (profundidade média ou variável)
- Conversão de unidades (L/m³)
- Regra de três simples e composta (com abas)
- Simulador de dosagem sandbox (sem salvar)
- `VolumeEditor` no dashboard para atualizar volume diretamente
- Botão "Usar este volume" na calculadora que salva no pool

---

### ✅ Fase 5 — Estabilidade e Polish

_Fechar os gaps da versão atual antes de adicionar novas features._

#### Bugs críticos

- [x] Validar `volume > 0` antes de chamar `calcDosages` — banner de aviso em `ChemicalSection`
- [x] Tratar `hardness = 0` como `null` (unknown) — corrigido em `chemistry.ts`
- [x] Limpar push subscription no logout — `LogoutButton` chama `DELETE /api/push/subscribe` antes de `signOut`
- [x] Comparação de datas de tarefas com timezone — `getTasks` usa `Intl.DateTimeFormat` com `America/Sao_Paulo`
- [x] `CompleteTaskButton` não tratava erro retornado por `completeTask` — corrigido
- [x] `DosageSandbox` já recebia produtos como prop (confirmado); `ApplyDosageButton` já exibia erros da RPC

#### UX — Quick Wins

- [x] **Toast de feedback** — `ToastProvider` no layout; `useToast` em todos os componentes de mutação
- [x] **Botão de submit com loading** — já implementado na maioria; `CompleteTaskButton` tem spinner
- [x] **Estado vazio com CTA** — já implementado em medições, tarefas e produtos
- [x] **`measured_at` editável** — campo `datetime-local` no formulário de nova medição
- [x] **Confirmação de exclusão** — já padronizada com `Modal` em medições e produtos

#### Arquitetura

- [x] **Retorno de erro nas Server Actions** — já implementado na maioria; `CompleteTaskButton` corrigido
- [x] **`error.tsx`** — criado em `(app)/error.tsx` (cobre todas as subrotas do grupo)
- [ ] **Separar `queries.ts`** por domínio — adiado para não impactar velocidade da Fase 6
- [x] **Script `gen:types`** — `npm run gen:types` adicionado ao `package.json`

#### Acessibilidade

- [x] `aria-label` e `aria-current` em cada link do `BottomNav`
- [x] `StatusDot` com `role="img"` e `aria-label` por status
- [x] Focus trap no `Modal` — implementado com `useRef` + interceptação de `Tab`; `role="dialog"` e `aria-modal` adicionados

#### Banco

- [x] Migration `007_performance_indexes.sql` — índices compostos em `measurements`, `tasks` e `product_applications`

---

### ✅ Fase 6 — Features de Retenção

_Funcionalidades que aumentam o uso contínuo e reduzem o churn._

#### Medições e tarefas

- [x] **Edição de medições** — `EditMeasurementButton` abre modal com `defaultValues`; salva via `editMeasurement` action
- [x] **Edição de tarefas** — `EditTaskButton` em `TaskItem`; `updateTask` action com revalidação de `/tarefas` e `/`
- [x] **Notas de medição exibidas** no histórico — já exibidas como texto truncado na linha de data/status

#### Estoque e alertas

- [x] **Banner de estoque baixo** — alerta visual em `/produtos` com lista de nomes; thresholds: ≤1 para kg/L, ≤500 para g/ml
- [x] **Lista de compras automática** — `ShoppingListButton` gera lista formatada e copia para clipboard via `navigator.clipboard`
- [x] **Notificações push automáticas via cron** — `vercel.json` com schedule `0 11 * * *` (08:00 BRT); `/api/push/notify` verifica `Authorization: Bearer CRON_SECRET`; modo cron usa `createAdminClient()` e processa todos os usuários

#### Dashboard

- [x] **Medição Rápida no dashboard** — `NewMeasurementButton` substituiu o emoji 🌊 no `action` slot do Header

#### Banco

- [x] **Soft delete** em `measurements` e `products` — migration `008_soft_delete.sql`; `deleteMeasurement` e `deleteProduct` fazem `UPDATE deleted_at = now()`; queries filtram `WHERE deleted_at IS NULL`
- [x] **`createAdminClient`** — cliente Supabase com service_role para uso em cron routes

#### Cleanup

- [x] **`CostReport.tsx` removido** — era dead code; `ApplicationsReport` já cobre o mesmo propósito

#### Pendente (adiado)

- [ ] **Relatório PDF mensal** — movido para Fase 7
- [ ] **Idempotência na RPC `apply_product_usage`** — `idempotency_key UUID` para evitar double-submit

---

### Fase 7 — Inteligência

_Tornar o app preditivo e contextual._

#### IA química

- [ ] **Diagnóstico por IA (Claude API)** — botão "Explicar situação da piscina" que gera análise em linguagem natural: estado atual, causas prováveis, plano de ação passo a passo
- [ ] **Sugestão inteligente de correção** — IA considera produtos em estoque ao recomendar (ex: "Você tem Cloro HTH, use 48g antes do tratamento de pH")

#### Análise de dados

- [ ] **Linha de tendência no gráfico** — regressão linear simples indicando se parâmetro está subindo ou descendo
- [ ] **Previsão de esgotamento** — "Com base no consumo médio, seu cloro acaba em ~X dias"
- [ ] **Índice de Saturação de Langelier (ISL)** — cálculo avançado de equilíbrio (pH + alcalinidade + dureza + temperatura + TDS); ISL ideal: −0.3 a +0.3

#### Contexto externo

- [ ] **Integração climática** — Open-Meteo API (gratuita) para alertar quando temperatura alta vai acelerar consumo de cloro

#### Múltiplas piscinas

- [ ] **Suporte a múltiplas piscinas por usuário** — seletor de piscina ativa no Header; todos os componentes recebem `poolId` como prop/parâmetro; preparar migração dos usuários existentes

#### Performance

- [ ] **Paginação por cursor** no histórico de medições e aplicações
- [ ] **Views materializadas** no Supabase para médias mensais e total de gastos (atualizadas via trigger)
- [ ] **Downsampling no gráfico** — média diária quando houver mais de 30 medições
- [ ] **Offline cache** no service worker para a dashboard (Stale-While-Revalidate para última medição)

#### Qualidade

- [ ] **Testes de `finance.ts`** — cálculo de custo por unidade (lógica de dinheiro crítica)
- [ ] **Testes de `calculators/volume.ts`** — fórmulas geométricas para cada formato de piscina
- [ ] **Separar `chemistry.ts`** em `chemistry/parameters.ts` e `chemistry/dosage.ts`
- [ ] **Constantes de dosagem nomeadas** — remover números mágicos das fórmulas de `calcDosages`

---

### Fase 8 — SaaS / Crescimento

_Oportunidades de monetização e expansão de mercado._

#### OCR e automação de entrada

- [ ] **OCR de fita de teste** — usuário fotografa a fita; app usa Vision API (Google ou Claude multimodal) para ler valores de pH/cloro automaticamente e pré-preencher o formulário

#### Modo profissional (B2B)

- [ ] **Gestão multitenancy para piscineiros** — um piscineiro gerencia piscinas de vários clientes; relatórios por cliente; histórico de visitas; envio automático de relatório ao cliente por e-mail
- [ ] **Planos de assinatura** — mensal/anual por número de piscinas gerenciadas (Stripe)

#### Social e retenção

- [ ] **Compartilhamento familiar** — convidar outro usuário para co-gerenciar a mesma piscina (sistema de invites + modelo de permissão)
- [ ] **Gamificação** — badges por consistência: "30 dias com água ideal", "Nunca perdeu tarefa em 3 meses", "Químico Expert"; histórico de conquistas

#### Ecossistema

- [ ] **Marketplace afiliados** — ao recomendar produto não disponível em estoque, exibir link de compra (Amazon/Mercado Livre) com comissão de afiliado
- [ ] **API pública + Webhooks** — endpoint para apps de terceiros consultarem estado da piscina e receberem alertas; base para assistentes de voz e automação residencial
- [ ] **IoT e sondas automáticas** — webhook aberto para sondas de pH/ORP/cloro (Flipr, Violet, PoolLab) enviarem leituras automaticamente

---

## Prioridades por impacto × esforço

| Prioridade | Item | Fase | Impacto | Esforço |
|---|---|---|---|---|
| 🔴 Crítico | Validar volume > 0 antes de dosagem | 5 | Alto | Muito baixo |
| 🔴 Crítico | Toast de feedback pós-ação | 5 | Alto | Muito baixo |
| 🔴 Crítico | Botão submit com loading | 5 | Alto | Muito baixo |
| 🔴 Crítico | Retorno de erro nas Server Actions | 5 | Alto | Médio |
| 🟠 Alta | Estado vazio com CTA | 5 | Alto | Baixo |
| 🟠 Alta | Notificações push via cron | 6 | Alto | Baixo |
| 🟠 Alta | Alerta de estoque baixo e vencimento | 6 | Alto | Baixo |
| 🟠 Alta | Edição de medições e tarefas | 6 | Alto | Baixo |
| 🟡 Média | Diagnóstico por IA (Claude API) | 7 | Muito alto | Médio |
| 🟡 Média | Índices faltantes no banco | 5 | Médio | Muito baixo |
| 🟡 Média | Linha de tendência no gráfico | 7 | Médio | Baixo |
| 🟡 Média | Soft delete em medições/produtos | 6 | Médio | Baixo |
| 🟢 Longo prazo | OCR de fita de teste | 8 | Muito alto | Alto |
| 🟢 Longo prazo | Modo profissional B2B | 8 | Muito alto | Muito alto |
| 🟢 Longo prazo | Múltiplas piscinas | 7 | Alto | Alto |
| 🟢 Longo prazo | Compartilhamento familiar | 8 | Médio | Alto |
