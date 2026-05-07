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

### Fase 5 — Estabilidade e Polish

_Fechar os gaps da versão atual antes de adicionar novas features._

#### Bugs críticos

- [ ] Validar `volume > 0` antes de chamar `calcDosages` — exibir aviso para configurar volume
- [ ] Tratar `hardness = 0` como `null` (unknown) — valor 0 gera recomendação absurda
- [ ] Limpar push subscription no logout (`DELETE /api/push/subscribe` em `signOut`)
- [ ] Comparação de datas de tarefas considerar timezone do usuário (atualmente usa UTC)
- [ ] `ApplyDosageButton` exibir mensagem de erro quando estoque insuficiente
- [ ] `DosageSandbox` receber produtos ativos como prop (evitar fetch duplicado e usar fórmulas personalizadas)

#### UX — Quick Wins

- [ ] **Toast de feedback** após qualquer ação (salvar, deletar, aplicar dosagem)
- [ ] **Botão de submit com loading** — `disabled` + spinner enquanto Server Action processa
- [ ] **Estado vazio com CTA** em medições, tarefas e produtos quando a lista está vazia
- [ ] **`measured_at` editável** — `<input type="datetime-local">` com valor padrão `now()`
- [ ] **Confirmação de exclusão** padronizada em todos os deletes (hoje inconsistente)

#### Arquitetura

- [ ] **Retorno de erro nas Server Actions** — padrão `{ ok: boolean; error?: string }` com exibição no modal
- [ ] **`error.tsx`** nas rotas `/`, `/medicoes`, `/produtos`, `/tarefas`
- [ ] **Separar `queries.ts`** por domínio: `queries/pools.ts`, `queries/measurements.ts`, etc.
- [ ] **Supabase types gerados via CLI** — `supabase gen types typescript` como script no `package.json`

#### Acessibilidade

- [ ] `aria-label` e `title` em cada link do `BottomNav`
- [ ] Texto descritivo no `StatusBadge` (não só cor) para leitores de tela
- [ ] Foco preso dentro do `Modal` ao abrir (trap focus via `Tab`)

#### Banco

- [ ] Índices faltantes:
  ```sql
  CREATE INDEX measurements_measured_at_idx ON measurements (measured_at DESC);
  CREATE INDEX tasks_next_due_idx ON tasks (next_due ASC);
  CREATE INDEX product_applications_applied_at_idx ON product_applications (applied_at DESC);
  ```

---

### Fase 6 — Features de Retenção

_Funcionalidades que aumentam o uso contínuo e reduzem o churn._

#### Medições e tarefas

- [ ] **Edição de medições** — modal com `defaultValues` para corrigir valores errados
- [ ] **Edição de tarefas** — alterar título, categoria e frequência após criação
- [ ] **Notas de medição exibidas** no histórico (campo existe no banco, não aparece na UI)

#### Estoque e alertas

- [ ] **Banner de estoque baixo** — alerta visual em `/produtos` quando `quantity ≤ limiar` ou `expiration_date ≤ 30 dias`
- [ ] **Lista de compras automática** — gerar lista de produtos com estoque baixo; exportar como texto ou PDF
- [ ] **Notificações push automáticas via cron** — configurar Vercel Cron Jobs para chamar `/api/push/notify` diariamente

#### Exportação

- [ ] **Relatório PDF mensal** — parâmetros, dosagens aplicadas, custos e tarefas do mês (`@react-pdf/renderer` ou `jsPDF`)

#### Dashboard

- [ ] **Modo "Medição Rápida"** — formulário mínimo no dashboard (pH + cloro) sem abrir `/medicoes`
- [ ] Unificar `CostReport` e `ApplicationsReport` em Insights — hoje têm propósitos sobrepostos confusos

#### Banco

- [ ] **Soft delete** em `measurements` e `products` — coluna `deleted_at TIMESTAMPTZ DEFAULT NULL`; filtrar `WHERE deleted_at IS NULL`
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
