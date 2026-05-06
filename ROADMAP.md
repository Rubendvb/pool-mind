# 🗺️ Pool Mind — Roadmap Técnico e Funcional

## 📖 Visão geral do produto

O Pool Mind é uma plataforma inteligente voltada para o controle químico e automação da manutenção de piscinas. Seu diferencial está em abandonar os cálculos genéricos e adotar cálculos reais baseados nos produtos específicos do usuário, aliando gestão financeira (custos reais de aplicação), automação e uma UX móvel simples (PWA).

## 🚀 Estratégia de evolução

A evolução do projeto se dará por fases incrementais, garantindo entregas de valor sem quebrar funcionalidades existentes, priorizando:

1. **Modelagem de Domínio (Produtos):** Integrar o estoque real aos cálculos da piscina.
2. **Inteligência Química e Financeira:** Lógicas de cálculo por produto e apuração de custos reais.
3. **Ferramentas Utilitárias:** Calculadoras de volume e de dosagem rápida para o dia a dia.
4. **Insights e Automação:** Fechar o ciclo com relatórios avançados, avisos e integrações futuras.

A arquitetura se mantém fiel a **Next.js 16 (App Router), Server Actions, Supabase (com RLS), TypeScript strict e Tailwind v4**. A estratégia de código foca em forte separação de domínio (ex: módulo de química puro e imutável separado da lógica de banco).

---

## 📅 Roadmap por Fases

### ✅ Fase 1 — Produtos Inteligentes e Estoque (Prioridade Alta)

_Integrar o estoque de produtos físicos do usuário na plataforma._

- **Objetivo:** Criar a fundação para os cálculos personalizados, gerenciando os produtos que o usuário efetivamente possui.
- **Funcionalidades:**
  - CRUD completo de produtos (tela `/produtos`).
  - Atributos base: Categoria química, concentração, validade, estoque, fabricante.
  - Ativar/Inativar produtos.
- **Impacto no Usuário:** Em vez de ver recomendações abstratas ("adicione cloro"), ele visualizará seus produtos reais na interface.
- **Dependências:** Nenhuma (independente das medições atuais).
- **Complexidade Estimada:** Baixa/Média.
- **Sugestões Técnicas:**
  - Criação da tabela `products` com RLS restrito ao `user_id`.
  - Uso intensivo de `React.cache()` ou instâncias do Supabase para otimizar busca de inventário.
  - _Status:_ Implementação base já iniciada (schema pronto).

### ✅ Fase 2 — Dosagem Personalizada por Produto (Prioridade Altíssima)

_O grande diferencial técnico do app: cálculos baseados nas regras de cada produto._

- **Objetivo:** Substituir as fórmulas genéricas por fórmulas vinculadas aos produtos específicos.
- **Funcionalidades:**
  - Configuração de métrica de dosagem no produto (ex: `10g` para cada `1000L` eleva `1ppm`).
  - Adaptação do `calcDosages` da Dashboard para utilizar a dosagem real em vez do _fallback_.
  - Cálculo de diluição em segundo plano.
- **Impacto no Usuário:** Resultados ultraprecisos ("Adicione 48g do seu Cloro HTH 90%").
- **Dependências:** Fase 1.
- **Complexidade Estimada:** Alta.
- **Sugestões Técnicas:**
  - Adicionar campos em `products`: `dosage_reference_amount`, `dosage_reference_liters`, `dosage_effect_value`, `dosage_effect_type`.
  - Desacoplar a lógica matemática (`src/lib/chemistry.ts`) para injetar produtos ativamente.

### ✅ Fase 3 — Inteligência Financeira e Consumo (Custos Reais)

_Transformar dados químicos em inteligência financeira._

- **Objetivo:** Rastrear as aplicações diárias e calcular quanto a manutenção custa na prática.
- **Funcionalidades:**
  - Registro de atributos de preço (`price`, `price_unit`, `package_quantity`).
  - Histórico de aplicações: Produto, quantidade aplicada, data, custo gerado, e medição relacionada.
  - Baixa de estoque automática via confirmação da Dashboard.
- **Impacto no Usuário:** Controle total e transparente dos gastos da piscina.
- **Dependências:** Fases 1 e 2.
- **Complexidade Estimada:** Média.
- **Sugestões Técnicas:**
  - Tabela `product_applications` (log imutável).
  - Triggers em SQL (Supabase) ou Server Actions transacionais para garantir a consistência do campo `stock` nos produtos.

### Fase 4 — Utilitários e Calculadora de Volume da Piscina

_Ferramentas essenciais para onboarding e correções paramétricas._

- **Objetivo:** Auxiliar usuários a ajustarem medidas sem sair do app.
- **Funcionalidades:**
  - Módulo `/calculadoras/piscina`: Fórmulas exatas para retangular, redonda e oval (profundidade média).
  - Central de ferramentas `/calculadoras`: Conversões (L/m³), Regra de 3 simples, dosagens sandbox.
- **Impacto no Usuário:** Utilitário conveniente que evita troca de abas e apps de calculadora.
- **Dependências:** Nenhuma.
- **Complexidade Estimada:** Baixa.
- **Sugestões Técnicas:**
  - Focar no **Client-Side Rendering (CSR)** com React State para cálculos instantâneos e interativos, evitando latência com Server Actions desnecessárias.

### Fase 5 — Estoque Inteligente e Insights Avançados

_Fechando o ciclo atual com alertas, automação e BI básico._

- **Objetivo:** Prevenir problemas de água verde por falta de produto e prover relatórios.
- **Funcionalidades:**
  - Alertas push e dashboard visual de estoque baixo e produtos próximos ao vencimento.
  - Previsões financeiras baseadas no consumo ("Será necessário comprar produto mês que vem").
  - Analytics gerenciais (Custo por litro da piscina, Produto mais eficiente, etc.).
- **Impacto no Usuário:** Gestão preditiva. Nenhuma surpresa financeira.
- **Dependências:** Fase 3 (para métricas e histórico contínuos).
- **Complexidade Estimada:** Alta.
- **Sugestões Técnicas:**
  - Criar views materializadas (`CREATE MATERIALIZED VIEW`) no Supabase para processamento dos dashboards pesados.
  - Conectar Edge Functions a cron jobs via `pg_cron` para checagem de estoque diário.

---

## 🔮 Fase 6 e Além (Evolução Futura & SaaS)

_Oportunidades de crescimento e monetização em longo prazo._

1. **Gestão Multitenancy (B2B):** Capacidade para piscineiros gerirem dezenas de piscinas simultaneamente com múltiplos escopos.
2. **Diagnóstico IA (LLM) & Câmera (OCR):** Utilização da câmera via web API para ler as fitas de teste de cloro/pH, mais integração de LLMs para diagnosticar a água (ex: _água verde_, sugerir plano de supercloração).
3. **Clima Dinâmico:** Integração com APIs meteorológicas para prever o consumo do cloro em ondas de calor.
4. **Internet das Coisas (IoT):** Leitura via sondas de pH/ORP via webhooks abertos.
5. **Monetização B2C:** Funcionalidades Analytics (Fase 5) atrás de paywalls usando Stripe para planos premium.
6. **Gamificação:** "Badges" ou condecorações por manter o balanço de Langelier neutro/estável por 30 dias seguidos.
