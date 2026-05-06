# Assistente Inteligente de Manutenção e Química da Piscina

Criar um aplicativo completo (PWA) para controle químico e manutenção de piscinas e da casa, focado em facilidade de uso, automação de cálculos e acompanhamento recorrente da manutenção.

## User Review Required

> [!IMPORTANT]
> **Stack Tecnológica:** A arquitetura proposta usará **Next.js (App Router)**, **TypeScript** e **Supabase** (preferencial sobre o Firebase devido ao poder do banco relacional PostgreSQL para gráficos e históricos complexos).

> [!WARNING]
> **Tailwind CSS:** Você solicitou o uso do Tailwind CSS. Precisamos definir qual versão utilizar, pois isso muda a forma como o projeto é configurado.

## Open Questions

> [!IMPORTANT]
> Por favor, responda às perguntas abaixo para iniciarmos o setup do projeto:
> 1. **Versão do Tailwind CSS:** Devemos usar o Tailwind v3 ou o mais recente Tailwind v4?
> 2. **Backend/Banco de Dados:** Você concorda em utilizarmos o **Supabase** ao invés do Firebase? Ele oferece melhor suporte para os relatórios e histórico que você deseja.
> 3. **Design e Cores:** Existe alguma paleta de cores preferida (ex: tons de azul oceano com detalhes em verde/amarelo/vermelho para status)?
> 4. **Mock de Dados:** Prefere que comecemos criando a interface visual (Frontend com dados falsos) primeiro, ou já conectamos direto com o banco de dados desde o início?

## Proposed Changes

O projeto será estruturado nas seguintes fases:

### Fase 1: Fundação do Projeto
- Inicialização do Next.js com `npx create-next-app@latest`.
- Configuração do PWA utilizando bibliotecas como `next-pwa` ou `serwist`.
- Configuração do Tailwind CSS, variáveis de tema (design premium, glassmorphism e micro-animações).
- Integração do Supabase para Autenticação.

### Fase 2: Banco de Dados (Schema Inicial Supabase)
- **Pools (Piscinas):** `id`, `user_id`, `volume`, `revestimento`.
- **Measurements (Medições):** `id`, `pool_id`, `ph`, `cloro_livre`, `alcalinidade`, `dureza`, `data`, `imagem_url`.
- **Tasks (Tarefas):** `id`, `user_id`, `titulo`, `categoria`, `frequencia`, `proxima_execucao`, `status`.

### Fase 3: Monitor Químico e Cálculos (Core)
- Implementação da **Interface de Diagnóstico (Dashboard)** com gráficos de evolução.
- Algoritmo de cálculo inteligente:
  - Comparação da medição atual vs ideal.
  - Cálculo de dosagem baseado no volume da piscina e concentração do produto.
- Alertas visuais de perigo ou atenção baseados nos parâmetros.

### Fase 4: Agenda e Recorrência
- Sistema de checklist e gerenciamento de tarefas para a Piscina e para a Casa.
- Lógica de recorrência para recalcular a `proxima_execucao` ao concluir uma tarefa.

### Fase 5: Insights e Notificações Push
- Geração de relatórios de consumo e custos.
- Integração de Service Workers para notificações Push (lembretes de tarefas e medições).

## Verification Plan

### Testes Automatizados
- Implementação de testes unitários rígidos para as funções matemáticas de cálculo de dosagem química para garantir que nunca sejam sugeridas quantidades perigosas de produtos.

### Verificação Manual
- Instalar o PWA localmente (via Chrome/Safari mobile) para testar a responsividade e o *look and feel* de um app nativo.
- Testar fluxos offline e sincronização posterior.
