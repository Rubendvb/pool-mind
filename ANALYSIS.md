# Pool Mind — Análise Estratégica e Técnica

> Documento gerado em 2026-05-06. Cobre arquitetura, código, UX, banco, performance, bugs, refatorações e oportunidades de produto.

---

## Índice

1. [Pontos Fortes](#1-pontos-fortes)
2. [Problemas Arquiteturais](#2-problemas-arquiteturais)
3. [Possíveis Bugs](#3-possíveis-bugs)
4. [Inconsistências](#4-inconsistências)
5. [Performance](#5-performance)
6. [Qualidade de Código e Refatorações](#6-qualidade-de-código-e-refatorações)
7. [UX/UI — Mobile First](#7-uxui--mobile-first)
8. [Acessibilidade](#8-acessibilidade)
9. [Banco de Dados e Supabase](#9-banco-de-dados-e-supabase)
10. [Novas Funcionalidades — Curto Prazo](#10-novas-funcionalidades--curto-prazo)
11. [Novas Funcionalidades — Longo Prazo e SaaS](#11-novas-funcionalidades--longo-prazo-e-saas)
12. [Roadmap Sugerido com Prioridades](#12-roadmap-sugerido-com-prioridades)

---

## 1. Pontos Fortes

| Ponto | Detalhe |
|---|---|
| Domínio bem modelado | `chemistry.ts` é puro e testável; lógica de dosagem desacoplada do banco |
| RLS correto | Todas as tabelas têm políticas por `user_id`; RPC `apply_product_usage` é transacional |
| Server/Client bem separado | Páginas são async Server Components; `"use client"` apenas onde necessário |
| Testes que cobrem o core | `chemistry.test.ts` cobre status, dosagem, prioridade e proporcionalidade por volume |
| Dados financeiros consistentes | Cálculo de custo via `finance.ts` valida compatibilidade de unidades antes de calcular |
| PWA funcional | Service worker registrado, manifest configurado, notificações push com VAPID |
| Tailwind v4 sem config | Customização 100% via `@theme` em `globals.css`; sem `tailwind.config.js` |
| Trigger de recorrência | `advance_task_due` no banco garante consistência mesmo se o client falhar |
| Calculadoras CSR | Cálculos são instantâneos no client, sem latência de Server Action desnecessária |

---

## 2. Problemas Arquiteturais

### 2.1 Piscina única hardcoded

`getPool()` usa `limit(1)` ordenado por `created_at`. Qualquer usuário que, via API direta ou bug, crie duas piscinas só verá a mais antiga. O conceito de "piscina ativa" não existe na UI. Remover essa limitação no futuro exigirá refatorar todos os componentes que assumem um único `pool`.

**Recomendação:** introduzir `pool_id` como contexto (query param ou cookie), preparando a expansão para multi-pool sem quebrar a UX atual.

---

### 2.2 Server Actions sem retorno de erro estruturado

Quase todas as Server Actions retornam `void` ou fazem `redirect`. Se um insert falhar (RLS, constraint, rede), o usuário não recebe feedback. O formulário fecha e nada acontece.

```typescript
// Padrão atual — falha silenciosa
export async function addMeasurement(formData: FormData) {
  const { error } = await supabase.from('measurements').insert(...)
  // error é ignorado
  revalidatePath('/')
}
```

**Recomendação:** adotar um padrão de retorno `{ ok: boolean; error?: string }` e exibir erros via estado no Client Component que chamou a action.

---

### 2.3 `queries.ts` monolítico

Todas as queries do projeto estão em um único arquivo. Com novos módulos (financeiro, aplicações, múltiplos pools), esse arquivo se torna um gargalo de legibilidade e manutenção.

**Recomendação:** separar por domínio: `queries/pools.ts`, `queries/measurements.ts`, `queries/products.ts`, `queries/tasks.ts`, `queries/applications.ts`.

---

### 2.4 Sem `error.tsx` nas rotas

Se um Server Component lançar uma exceção (ex: Supabase indisponível), o Next.js exibe a página de erro global genérica. Não há `error.tsx` em nenhuma rota.

**Recomendação:** adicionar `error.tsx` nas rotas críticas (`/`, `/medicoes`, `/produtos`) com mensagem amigável e botão de retry.

---

### 2.5 `image_url` como campo morto

`Measurement` tem `image_url` no schema, nas migrations e nos tipos, mas nenhum componente permite fazer upload ou exibir a imagem. É dead code que confunde quem lê o schema.

**Recomendação:** remover o campo dos tipos enquanto a feature não é implementada, ou implementar o upload básico via Supabase Storage.

---

### 2.6 Push notifications sem limpeza no logout

Ao fazer logout, as subscriptions de push do usuário permanecem ativas em `push_subscriptions`. Se outro usuário logar no mesmo dispositivo, as notificações do anterior continuam sendo enviadas.

**Recomendação:** chamar `DELETE /api/push/subscribe` durante o fluxo de `signOut` no `LogoutButton`.

---

## 3. Possíveis Bugs

### 3.1 `calcDosages` com volume zero ou null

Se `pool.volume` for `0` (usuário não atualizou após o onboarding), todas as dosagens retornam `0`. A UI exibe recomendações como "adicione 0g de Barrilha", o que é enganoso.

**Recomendação:** validar `volumeLiters > 0` antes de chamar `calcDosages` e exibir aviso para configurar o volume.

---

### 3.2 Dureza 0 gera dosagem absurda

Em `chemistry.ts`, se `hardness = 0`, o delta é `400` (max ideal - 0), gerando uma recomendação de kilos de cloreto de cálcio. O valor `0` pode ser inserido pelo usuário pensando em "não medido".

**Recomendação:** tratar `hardness = 0` como `null` (unknown), ou adicionar validação `min="1"` no formulário.

---

### 3.3 Trigger SQL sem fallback no client

Se o trigger `advance_task_due` falhar silenciosamente (ex: role sem permissão num ambiente de staging), a tarefa fica com `status = 'concluida'` e `next_due` desatualizado. O client não verifica se a recorrência funcionou.

**Recomendação:** após `completeTask`, verificar na query retornada se `next_due` foi atualizado. Se não, mostrar aviso.

---

### 3.4 `DosageSandbox` usando dosagem genérica

O `DosageSandbox` simula dosagens mas pode não carregar os produtos ativos do usuário ao inicializar, caindo sempre no fallback genérico. Isso torna a simulação menos precisa do que a dashboard real.

**Recomendação:** verificar se `DosageSandbox` chama `getProducts()` com os produtos ativos do usuário e passa para `calcDosages`.

---

### 3.5 `ApplyDosageButton` sem feedback de estoque insuficiente

A RPC `apply_product_usage` valida o estoque antes de debitar. Se o estoque for insuficiente, ela retorna erro. Mas se o Client Component não tratar esse erro, o usuário vê o modal fechar sem resposta.

**Recomendação:** checar o retorno da RPC e exibir mensagem de erro dentro do modal.

---

### 3.6 Comparação de datas sem timezone

Em `getTasks()`, a comparação `next_due < today` é feita com `new Date().toISOString().split('T')[0]`. Se o usuário estiver em timezone negativo (ex: UTC-3), às 22h local a data já é "amanhã" em UTC, marcando tarefas como atrasadas erroneamente.

**Recomendação:** usar `Intl.DateTimeFormat` com o timezone do usuário, ou fazer a comparação no servidor com `NOW()::date`.

---

## 4. Inconsistências

| Local | Inconsistência |
|---|---|
| BottomNav label | Label é "Cálculos" mas a rota é `/calculadoras` e o título da página é "Calculadoras" |
| `CostReport` vs `ApplicationsReport` | Dois relatórios em Insights com propósitos sobrepostos — um usa dados reais (aplicações), outro usa estimativa retrospectiva. A distinção não é clara para o usuário |
| `notes` nas medições | Campo existe no form e no banco, mas não aparece na lista de histórico de medições |
| `manufacturer` nos produtos | Campo existe no formulário mas não é exibido no `ProductItem` nem nos relatórios |
| `price_unit` vs `unit` | O produto tem `unit` (unidade de estoque) e `price_unit` (unidade de precificação) — podem ser diferentes, gerando confusão no cálculo de custo |
| `measured_at` manual | O formulário de nova medição usa a data/hora atual sem campo para o usuário alterar. Medições feitas "depois" ficam com timestamp errado |
| Status "atrasada" só em memória | O banco usa apenas `pendente`/`concluida`; "atrasada" é calculado no client. Se o trigger avançar a data, pode haver flash de status errado |

---

## 5. Performance

### 5.1 Sem paginação real

`getMeasurements` limita a 10 registros, `getApplications` a 30. Não há paginação nem cursor. Com uso prolongado, o usuário não vê dados históricos.

**Recomendação:** implementar paginação por cursor (`measured_at < last_seen`) ou infinite scroll.

---

### 5.2 `ParameterChart` sem agregação

O gráfico de evolução carrega todas as medições (até o limite da query). Com 10 medições por request, o gráfico fica limitado, mas se o limite aumentar, a renderização do Recharts pode ser pesada.

**Recomendação:** limitar o gráfico aos últimos 30 dias com downsampling (média diária) se houver mais de 30 medições.

---

### 5.3 Produtos buscados múltiplas vezes

`ChemicalSection` e `DosageSandbox` provavelmente buscam `getProducts()` independentemente. O `cache()` do React deduplicaria se chamados no mesmo request, mas o sandbox é Client Component (faz fetch próprio).

**Recomendação:** passar os produtos como prop para o sandbox via Server Component pai, evitando fetch duplo.

---

### 5.4 Sem Optimistic UI nas mutations

Concluir uma tarefa ou deletar uma medição espera o round-trip completo antes de atualizar a UI. Com `useOptimistic` do React 18, a UI poderia responder instantaneamente.

---

### 5.5 Service Worker sem estratégia de cache offline

O service worker está registrado mas não há estratégia definida para cache offline (ex: Stale-While-Revalidate para a dashboard). O app quebra sem internet.

**Recomendação:** adicionar estratégia de cache para a página principal e as últimas medições via Workbox ou fetch handler manual no SW.

---

## 6. Qualidade de Código e Refatorações

### 6.1 Padrão Modal + Form repetido

`NewMeasurementButton`, `NewTaskButton`, `ProductFormButton`, `ApplyDosageButton` seguem o mesmo padrão: botão que abre um `Modal` com um formulário que chama uma Server Action. O código é repetido sem abstração.

**Sugestão de refatoração:**
```typescript
// Um hook genérico
function useFormModal<T>(action: (data: T) => Promise<void>) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const submit = (data: T) => startTransition(async () => {
    await action(data)
    setOpen(false)
  })
  return { open, setOpen, submit, pending }
}
```

---

### 6.2 `chemistry.ts` mistura duas responsabilidades

O arquivo contém tanto a avaliação de status dos parâmetros (`buildParameters`, `overallStatus`) quanto os cálculos de dosagem (`calcDosages`). São domínios diferentes que evoluem por razões diferentes.

**Sugestão:** separar em `chemistry/parameters.ts` e `chemistry/dosage.ts`.

---

### 6.3 Constantes mágicas nos cálculos

Em `chemistry.ts`, os valores de referência para dosagem (`20g / 10.000L / 0.2 delta`) estão hardcoded dentro da função. Dificultam manutenção e compreensão.

```typescript
// Atual
amount = Math.ceil((delta / 0.2) * 20 * (volumeLiters / 10000))

// Melhor
const PH_PLUS_REF = { amount: 20, per_liters: 10000, per_delta: 0.2 } // g
amount = Math.ceil((delta / PH_PLUS_REF.per_delta) * PH_PLUS_REF.amount * (volumeLiters / PH_PLUS_REF.per_liters))
```

---

### 6.4 Testes cobre apenas `chemistry.ts`

Toda a lógica de `finance.ts`, `calculators/volume.ts`, e os Server Actions não têm testes. Uma falha no cálculo de custo ou de volume passa despercebida.

**Prioridades de teste:**
1. `finance.ts` — cálculo de custo por unidade (lógica crítica de dinheiro)
2. `calculators/volume.ts` — fórmulas geométricas para cada formato
3. Server Actions — smoke tests de integração com Supabase local

---

### 6.5 `src/lib/supabase/types.ts` mantido manualmente

O arquivo de tipos do schema é mantido à mão. Qualquer migration que adiciona colunas exige atualização manual. Isso gera dessincronia silenciosa.

**Recomendação:** usar `supabase gen types typescript` na CLI do Supabase e commitar o output gerado automaticamente via script.

---

## 7. UX/UI — Mobile First

### Problemas identificados

| Problema | Impacto | Complexidade |
|---|---|---|
| Sem toast/snackbar de sucesso | Usuário não sabe se a ação funcionou | Baixa |
| Sem estado vazio com CTA | Páginas de medições/tarefas vazias não guiam o usuário | Baixa |
| Sem edição de medições | Erro de digitação → deletar e recriar | Média |
| Sem edição de tarefas | Não é possível mudar título ou frequência depois | Média |
| Campo `measured_at` não editável | Medições "retroativas" ficam com horário errado | Baixa |
| Sem filtro/busca em tarefas | Com 20+ tarefas, difícil achar o que procura | Média |
| Dois relatórios em Insights | `CostReport` e `ApplicationsReport` — propósito confuso | Baixa |
| Modal muito longo em mobile | `ProductFormButton` tem muitos campos — formulário scrollável | Média |
| BottomNav com 6 itens | Em telas estreitas (320px), labels ficam truncados | Média |
| Sem feedback de loading em forms | Submit sem `disabled` ou spinner no botão | Baixa |

### Quick Wins de UX (impacto alto, custo baixo)

1. **Toast de sucesso**: usar um componente `<Toast>` simples com `useEffect` + `useState` ativado após mutação
2. **Empty states**: SVG + texto + botão de ação para medições, tarefas e produtos quando a lista está vazia
3. **Botão de submit com loading**: `disabled={pending}` + spinner no texto enquanto Server Action processa
4. **`measured_at` editável**: `<input type="datetime-local">` com valor padrão `new Date()`
5. **Confirmação de exclusão consistente**: padronizar o dialog de confirmação em todos os deletes

---

## 8. Acessibilidade

| Problema | Recomendação |
|---|---|
| Ícones de nav são emoji sem `aria-label` | Adicionar `aria-label` e `title` em cada `<Link>` do BottomNav |
| Status visual só por cor | Adicionar texto (`"OK"`, `"Atenção"`, `"Perigo"`) no `StatusBadge` para leitores de tela |
| `Modal` sem foco trapped | O foco deve ser preso dentro do modal ao abrir (Tab não pode sair) |
| Formulários sem `<legend>` | Campos agrupados (ex: parâmetros da medição) deveriam ter `<fieldset>` + `<legend>` |
| Contraste de texto | Texto `/35` de opacidade no BottomNav inativo pode não passar WCAG AA |

---

## 9. Banco de Dados e Supabase

### 9.1 Índices faltando

As migrations criam índices em `pool_id` e `user_id`, mas faltam:

```sql
-- Útil para filtrar por data no gráfico e no histórico
CREATE INDEX measurements_measured_at_idx ON measurements (measured_at DESC);

-- Útil para ordenar tarefas por urgência
CREATE INDEX tasks_next_due_idx ON tasks (next_due ASC);

-- Útil para relatório de aplicações
CREATE INDEX product_applications_applied_at_idx ON product_applications (applied_at DESC);
```

---

### 9.2 Sem soft delete

Deletar medição ou produto é irreversível. Se o usuário excluir acidentalmente, não há recuperação. Aplicações de produto ficam com `product_id = null` após o produto ser deletado (correto, mas perde o contexto).

**Recomendação:** adicionar `deleted_at TIMESTAMPTZ DEFAULT NULL` em `measurements` e `products`. Filtrar `WHERE deleted_at IS NULL` nas queries. Permite histórico auditável.

---

### 9.3 `apply_product_usage` sem idempotência

Se o client chamar a RPC duas vezes (ex: duplo-clique, retry automático), o estoque é debitado duas vezes e dois logs são criados.

**Recomendação:** adicionar um `idempotency_key UUID` no payload da RPC, verificando se já existe um registro com aquela chave antes de inserir.

---

### 9.4 Sem auditoria de mudanças em produtos

Quando o usuário edita preço ou concentração de um produto, o valor anterior é perdido. Isso afeta a precisão histórica dos relatórios de custo (aplicações passadas calculadas com preço atual).

**Recomendação:** snapshots de preço no momento da aplicação — guardar `price_at_application` junto com `cost` em `product_applications`.

---

### 9.5 Views materializadas para Insights

A página de Insights calcula médias e totais em runtime no client. Com muitas medições, isso pode ser lento.

**Recomendação:** criar views `monthly_parameter_averages` e `monthly_spending` no Supabase, atualizadas via trigger após insert em `measurements` e `product_applications`.

---

## 10. Novas Funcionalidades — Curto Prazo

Ordenadas por impacto/esforço.

### 10.1 Toast de feedback (Quick Win)
- **O que**: notificação visual temporária ao concluir ações (salvar, deletar, aplicar)
- **Impacto no usuário**: alta — elimina incerteza pós-ação
- **Complexidade**: baixa (1-2h)

### 10.2 Edição de medições e tarefas
- **O que**: modal de edição para corrigir valores registrados errados
- **Impacto**: alto — erro de digitação hoje exige deletar e recriar
- **Complexidade**: baixa (reutiliza o mesmo Modal/form com `defaultValues`)

### 10.3 Alerta de estoque baixo e vencimento
- **O que**: banner no topo da página Produtos quando algum produto está abaixo do limiar ou vence em ≤30 dias
- **Impacto**: alto — evita piscina sem produto na hora certa
- **Complexidade**: baixa (query já tem `quantity` e `expiration_date`)

### 10.4 Lista de compras automática
- **O que**: quando estoque < limiar, aparece botão "Adicionar à lista de compras". Gera uma lista exportável (texto ou PDF)
- **Impacto**: alto — fecha o ciclo entre estoque e compra
- **Complexidade**: média

### 10.5 Múltiplas piscinas
- **O que**: um usuário pode ter 2+ piscinas (ex: residência + sítio)
- **Impacto**: médio agora, alto para SaaS B2B
- **Complexidade**: alta (refatorar contexto de pool em toda a app)
- **Pré-requisito**: adicionar seletor de piscina ativo no Header

### 10.6 Histórico de parâmetros com previsão simples
- **O que**: linha de tendência no gráfico indicando se pH/cloro está subindo ou descendo
- **Impacto**: médio — ajuda a antecipar correções
- **Complexidade**: baixa (regressão linear simples no client)

### 10.7 Modo "Medição Rápida"
- **O que**: formulário simplificado no Dashboard com apenas pH e Cloro (os mais urgentes), sem abrir a página de medições
- **Impacto**: médio — reduz fricção para medições frequentes
- **Complexidade**: baixa

### 10.8 Exportar relatório mensal em PDF
- **O que**: botão em Insights que gera PDF com parâmetros, dosagens, custos e tarefas do mês
- **Impacto**: médio — valioso para usuários que querem manter arquivo
- **Complexidade**: média (`@react-pdf/renderer` ou `jsPDF`)

### 10.9 Campo `measured_at` editável
- **O que**: permitir o usuário definir data/hora da medição no formulário (não apenas usar `now()`)
- **Impacto**: médio — medições retroativas ficam corretas
- **Complexidade**: muito baixa (trocar campo hidden por `datetime-local`)

### 10.10 Notificações push automáticas via cron
- **O que**: agendar o endpoint `/api/push/notify` via cron externo (Vercel Cron Jobs, Supabase Edge Functions com `pg_cron`)
- **Impacto**: alto — as notificações hoje são 100% manuais
- **Complexidade**: baixa (configuração de cron, endpoint já existe)

---

## 11. Novas Funcionalidades — Longo Prazo e SaaS

### 11.1 OCR de fita de teste
- **O que**: usuário fotografa a fita de teste de cloro/pH; app usa OCR para ler os valores automaticamente
- **Impacto**: muito alto — elimina a digitação manual
- **Complexidade**: alta (Vision API do Google ou Claude API com multimodal)
- **Diferencial competitivo**: muito alto

### 11.2 Diagnóstico por IA (LLM)
- **O que**: botão "Explicar situação da piscina" que usa Claude API para gerar explicação em linguagem natural do estado da água, causas prováveis e plano de ação
- **Impacto**: alto — democratiza o conhecimento químico
- **Complexidade**: média (Claude API + prompt engineering)
- **Exemplo de output**: "Sua piscina está com cloro baixo e pH levemente alto. Isso geralmente acontece após dias de muito sol. Recomendo primeiro corrigir o pH para não inibir o cloro, depois clorar..."

### 11.3 Integração climática
- **O que**: puxar previsão do tempo (Open-Meteo API, gratuita) e alertar quando temperatura alta vai acelerar o consumo de cloro
- **Impacto**: médio — contexto inteligente sem esforço do usuário
- **Complexidade**: baixa/média

### 11.4 Índice de Saturação de Langelier (ISL)
- **O que**: cálculo avançado de equilíbrio da água que considera temperatura, pH, alcalinidade, dureza e TDS juntos. ISL ideal: entre -0.3 e +0.3
- **Impacto**: alto para usuários avançados — previne calcificação e corrosão
- **Complexidade**: média (fórmula bem documentada)

### 11.5 Modo Profissional (B2B)
- **O que**: um piscineiro pode gerenciar piscinas de vários clientes, com relatórios por cliente, histórico de visitas e envio automático de relatório ao cliente
- **Impacto**: alto para monetização
- **Complexidade**: alta (multitenancy, sistema de clientes, relatórios por cliente)
- **Modelo de preço**: assinatura mensal por número de piscinas gerenciadas

### 11.6 Compartilhamento familiar
- **O que**: convidar outro usuário (cônjuge, caseiro) para co-gerenciar a mesma piscina
- **Impacto**: médio — aumenta retenção
- **Complexidade**: alta (modelo de permissão, invites)

### 11.7 Gamificação
- **O que**: sistema de badges por consistência — "30 dias com água ideal", "Nunca perdeu tarefa em 3 meses", "Químico Experiente"
- **Impacto**: médio — retenção a longo prazo
- **Complexidade**: baixa (tabela de achievements + lógica de unlock)

### 11.8 IoT e Sensores
- **O que**: webhook aberto para sondas de pH/ORP/cloro enviarem leituras automaticamente (ex: Flipr, Violet, PoolLab)
- **Impacto**: alto para o futuro — automação total
- **Complexidade**: alta

### 11.9 Marketplace de produtos afiliados
- **O que**: ao recomendar um produto que o usuário não tem em estoque, exibir link de compra no Mercado Livre / Amazon com comissão de afiliado
- **Impacto**: médio — receita passiva + utilidade real
- **Complexidade**: baixa (API de afiliados)

### 11.10 API pública / Webhooks
- **O que**: permitir que apps de terceiros (automação residencial, assistentes de voz) consultem o estado da piscina e recebam alertas
- **Impacto**: baixo agora, alto a médio prazo para ecossistema
- **Complexidade**: média

---

## 12. Roadmap Sugerido com Prioridades

### Fase 5 — Estabilidade e Polish (1-2 semanas)

Fechar os gaps da versão atual antes de adicionar features.

| Item | Tipo | Impacto | Esforço |
|---|---|---|---|
| Toast de feedback pós-ação | UX | Alto | Muito baixo |
| Botão de submit com loading/disabled | UX | Alto | Muito baixo |
| Estado vazio com CTA em todas as listas | UX | Alto | Baixo |
| `measured_at` editável no form | UX | Médio | Muito baixo |
| `aria-label` no BottomNav | A11y | Alto | Muito baixo |
| `error.tsx` nas rotas principais | Arquitetura | Médio | Baixo |
| Retorno de erro nas Server Actions | Arquitetura | Alto | Médio |
| Limpeza de push subscription no logout | Bug | Médio | Baixo |
| Validar `volume > 0` antes de calcular dosagem | Bug | Alto | Muito baixo |
| Tratar `hardness = 0` como null | Bug | Médio | Muito baixo |

---

### Fase 6 — Features de Retenção (2-4 semanas)

| Item | Tipo | Impacto | Esforço |
|---|---|---|---|
| Edição de medições e tarefas | Feature | Alto | Baixo |
| Alerta de estoque baixo e vencimento | Feature | Alto | Baixo |
| Notificações push via Vercel Cron | Feature | Alto | Baixo |
| Lista de compras automática | Feature | Alto | Médio |
| Exportar relatório PDF mensal | Feature | Médio | Médio |
| Modo "Medição Rápida" no dashboard | Feature | Médio | Baixo |
| Índices faltantes no banco | Performance | Médio | Muito baixo |
| Supabase types gerados via CLI | Qualidade | Médio | Baixo |
| Separar `queries.ts` por domínio | Refatoração | Médio | Baixo |

---

### Fase 7 — Inteligência (1-2 meses)

| Item | Tipo | Impacto | Esforço |
|---|---|---|---|
| Diagnóstico por IA (Claude API) | Feature | Muito alto | Médio |
| Histórico com linha de tendência | Feature | Médio | Baixo |
| Índice de Langelier | Feature | Alto (avançados) | Médio |
| Integração climática | Feature | Médio | Baixo |
| Múltiplas piscinas | Arquitetura | Alto | Alto |
| Soft delete em medições e produtos | Arquitetura | Médio | Baixo |
| Views materializadas para Insights | Performance | Médio | Médio |

---

### Fase 8 — SaaS / Crescimento (3-6 meses)

| Item | Tipo | Impacto | Esforço |
|---|---|---|---|
| OCR de fita de teste | Feature | Muito alto | Alto |
| Modo profissional B2B | Produto | Muito alto | Muito alto |
| Compartilhamento familiar | Feature | Médio | Alto |
| Gamificação (badges) | Produto | Médio | Médio |
| Marketplace afiliados | Monetização | Médio | Médio |
| API pública + Webhooks | Plataforma | Médio | Alto |
| IoT / sondas automáticas | Feature | Alto | Muito alto |

---

## Síntese Executiva

**O que está bem:** arquitetura Server/Client, domínio químico desacoplado, RLS e transações atômicas, PWA funcional, testes no core.

**Gargalos prioritários:** ausência de feedback de erro nas actions, push notifications 100% manuais, nenhum índice de data nas queries de histórico, dois relatórios sobrepostos em Insights, estoque e vencimento sem alertas automáticos.

**Quick wins de maior ROI:** toast de feedback + loading em botões + estado vazio das listas + cron para push notifications — todas implementáveis em 1-2 dias, com impacto direto na percepção de qualidade do produto.

**Maior oportunidade de produto:** diagnóstico por IA (Claude API) + OCR de fita de teste. A combinação transforma o app de "planilha química bonita" em "assistente inteligente de piscina" — diferencial real de mercado.

**Caminho para SaaS:** múltiplas piscinas + modo profissional B2B. O modelo atual é pessoal; com pouca refatoração de contexto, pode atender piscineiros autônomos que gerenciam dezenas de piscinas — esse é o maior mercado endereçável.
