# AI Context --- Personal Finance App

Este arquivo fornece o contexto principal do projeto para ferramentas de
IA como Cursor, Claude e outros assistentes de desenvolvimento.

A IA deve sempre considerar este arquivo como ponto de partida antes de
gerar código, sugerir arquitetura ou implementar funcionalidades.

------------------------------------------------------------------------

# Visão geral do projeto

Este projeto é uma aplicação web de finanças pessoais.

O objetivo é permitir que usuários registrem, organizem e visualizem:

-   receitas
-   despesas
-   contas financeiras
-   investimentos
-   metas financeiras
-   evolução patrimonial

A aplicação substitui planilhas financeiras e fornece uma visão clara da
situação financeira do usuário.

Inicialmente o projeto está sendo desenvolvido como uma **prova de
conceito**.

O foco é:

-   boa arquitetura
-   organização de código
-   componentes reutilizáveis
-   estrutura escalável

------------------------------------------------------------------------

# Stack do projeto

Frontend - React - Vite - TypeScript - TailwindCSS

Bibliotecas permitidas - React Router - Recharts - Lucide React - clsx -
class-variance-authority - Zod - React Hook Form

Banco de dados - PostgreSQL

------------------------------------------------------------------------

# Arquivos de contexto importantes

A IA deve sempre considerar os seguintes arquivos como referência:

docs/product-context.md\
docs/cursor-rules.md\
docs/frontend-structure.md\
database/database-schema.sql

Cada arquivo tem um papel específico:

product-context.md\
→ descreve o produto e as regras de negócio.

cursor-rules.md\
→ define como o código deve ser gerado.

frontend-structure.md\
→ define arquitetura e organização do frontend.

database-schema.sql\
→ define o modelo de dados do sistema.

------------------------------------------------------------------------

# Estrutura principal do produto

Módulos principais do sistema:

-   Dashboard
-   Transações
-   Contas
-   Investimentos
-   Metas
-   Relatórios
-   Configurações

------------------------------------------------------------------------

# Diretrizes importantes

A IA deve priorizar:

-   código limpo
-   organização
-   escalabilidade
-   componentes reutilizáveis
-   clareza visual
-   arquitetura consistente

Evitar:

-   dependências desnecessárias
-   código excessivamente complexo
-   arquivos gigantes
-   abstrações prematuras
-   lógica misturada com UI

------------------------------------------------------------------------

# Estratégia de desenvolvimento

A construção do projeto seguirá as etapas:

1.  Estrutura base do projeto
2.  Layout principal da aplicação
3.  Dashboard
4.  Transações
5.  Contas
6.  Investimentos
7.  Metas
8.  Relatórios

Durante a prova de conceito:

-   usar dados mockados
-   focar em UX e arquitetura
-   não conectar backend inicialmente

------------------------------------------------------------------------

# Regras de UX

A interface deve seguir princípios de produtos financeiros modernos:

-   layout limpo
-   números com destaque
-   cards para informações principais
-   gráficos simples e claros
-   navegação previsível
-   foco em leitura rápida dos dados

------------------------------------------------------------------------

# Expectativa de geração de código

Quando gerar código, a IA deve preferir:

-   arquivos completos
-   estrutura de pastas clara
-   componentes reutilizáveis
-   tipagem consistente em TypeScript
-   Tailwind para styling
-   organização modular

------------------------------------------------------------------------

# Objetivo da prova de conceito

O objetivo desta fase é validar:

-   arquitetura do projeto
-   qualidade do código gerado por IA
-   estrutura de componentes
-   navegação do produto
-   clareza visual da interface

A prova de conceito deve servir como base para evolução futura do
produto.
