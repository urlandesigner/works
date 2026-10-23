# product-context.md

## Visão geral do produto
Aplicação web de finanças pessoais para substituir controle em planilhas e oferecer uma visão clara de receitas, despesas, contas, investimentos e patrimônio.

Objetivo inicial: prova de conceito funcional.

## Módulos principais
- Dashboard
- Transações
- Contas
- Investimentos
- Metas
- Relatórios
- Configurações

## Fluxos principais
Registrar despesa:
Dashboard → Transações → Nova transação → Salvar → Atualizar saldo → Atualizar dashboard

Registrar receita:
Dashboard → Transações → Nova transação → Salvar → Atualizar saldo → Atualizar dashboard

Criar conta:
Contas → Nova conta → Salvar → Exibir na lista

Adicionar investimento:
Investimentos → Novo investimento → Salvar → Atualizar patrimônio

Criar meta:
Metas → Nova meta → Salvar → Exibir progresso

## Entidades principais
- user
- account
- category
- transaction
- investment
- goal

## Regras de negócio
- toda transação pertence a uma conta
- receitas aumentam saldo
- despesas reduzem saldo
- valor deve ser maior que zero
- investimentos compõem patrimônio
