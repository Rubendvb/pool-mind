# Pool Mind — TODO

## Fase 1: Fundação do Projeto
- [x] Inicialização do Next.js (App Router + TypeScript)
- [x] Configuração do Tailwind v4 com tema azul oceano
- [x] Glassmorphism, variáveis de cor e design premium
- [ ] Configuração do PWA (next-pwa ou serwist) — manifest, service worker, ícones
- [x] Integração do Supabase para Autenticação (login/logout, sessão)

## Fase 2: Banco de Dados — Schema Supabase
- [x] Tabela `pools` — id, user_id, name, volume, type
- [x] Tabela `measurements` — id, pool_id, ph, chlorine, alkalinity, hardness, date, image_url, notes
- [x] Tabela `tasks` — id, user_id, title, category, frequency, next_due, status
- [x] Row Level Security (RLS) para todas as tabelas
- [x] Trigger `advance_task_due` para recalcular next_due ao concluir tarefa
- [x] Tipos TypeScript do schema (`src/lib/supabase/types.ts`)
- [x] Cliente Supabase server + browser (`src/lib/supabase/`)
- [x] Middleware de proteção de rotas
- [x] Página de login/cadastro
- [x] Queries tipadas (`getPool`, `getMeasurements`, `getTasks`, `insertMeasurement`, etc.)
- [x] Substituir mocks pelo cliente Supabase nas páginas
- [x] Criar projeto no Supabase e executar `supabase/migrations/001_initial_schema.sql`
- [x] Configurar `.env` com URL e publishable key do projeto

## Fase 3: Monitor Químico e Cálculos (Core)
- [x] Dashboard com status geral da piscina
- [x] Cards de parâmetros (pH, cloro, alcalinidade, dureza) com barra de progresso
- [x] Algoritmo de cálculo de dosagem (pH+/-, triclorado, bicarbonato)
- [x] Alertas visuais de perigo/atenção/ideal
- [x] Recomendações de correção com prioridade (urgente/em breve)
- [x] Formulário de nova medição (com validação e feedback)
- [ ] Gráficos de evolução dos parâmetros ao longo do tempo (ex: recharts ou chart.js)

## Fase 4: Agenda e Recorrência
- [x] Listagem de tarefas por categoria (piscina, jardim, casa)
- [x] Destaque de tarefas em atraso
- [x] Lógica de recorrência via trigger no banco (diária, semanal, quinzenal, mensal)
- [x] Ação de concluir tarefa (check) com UI
- [x] Formulário de nova tarefa com seleção de frequência

## Fase 5: Insights e Notificações Push
- [ ] Relatório de consumo de produtos químicos (quantidade e custo estimado)
- [ ] Gráfico de evolução de custos por período
- [ ] Service Worker para notificações Push (lembretes de medição e tarefas)
- [ ] Configuração de alertas personalizados

## Testes
- [ ] Testes unitários para `chemistry.ts` (dosagens, status dos parâmetros)
- [ ] Testes de integração para fluxo de nova medição → recomendação
