# Modelo financeiro híbrido – proposta

Este documento descreve o modelo de dados refinado (contas + investimentos vinculados a contas), as relações entre entidades, o impacto nos cálculos do dashboard e a adaptação dos mocks. **Nenhuma alteração de UI está incluída.**

---

## 1. Modelo de dados atualizado

### 1.1 Account (Conta)

- **Propósito:** Representar contas do usuário (corrente, poupança, conta de investimentos, etc.).
- **Regra:** Algumas contas podem conter investimentos; outras são apenas “caixa” (saldo + transações).

```ts
export type AccountType = 'checking' | 'savings' | 'investment' | 'other'

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  initial_balance: number
  allows_investments: boolean   // novo: indica se a conta pode ter investimentos
  created_at: string
}
```

- `allows_investments`: quando `true`, a conta pode ter registros de `Investment` vinculados a ela. Contas do tipo `investment` tipicamente têm `allows_investments: true`; contas `checking`/`savings` podem ser `false` ou `true` conforme a regra de negócio.

### 1.2 Investment (Investimento)

- **Propósito:** Ativos de renda fixa, renda variável ou cripto, sempre vinculados a uma conta.
- **Regra:** Todo investimento pertence a uma única conta (`account_id`).

```ts
export type InvestmentType = 'fixed_income' | 'variable_income' | 'crypto'

export interface Investment {
  id: string
  user_id: string
  account_id: string   // obrigatório: conta à qual o investimento pertence
  name: string
  type: InvestmentType
  invested_amount: number
  current_amount: number
  created_at?: string
}
```

- **Renda fixa:** Tesouro Direto, CDB, LCI, LCA, etc.
- **Renda variável:** ações, ETFs, FIIs, BDRs, etc.
- **Cripto:** criptomoedas em corretora/custódia vinculada à conta.

### 1.3 Transaction (Transação)

- Mantida como hoje: sempre associada a uma conta e a uma categoria.
- Transações movimentam o **saldo da conta**; não alteram diretamente o valor de um investimento (aplicação/resgate seriam modeladas como transação na conta + eventual registro de movimento no investimento, se necessário no futuro).

```ts
export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  category_id: string
  type: TransactionType
  description: string | null
  amount: number
  transaction_date: string
}
```

### 1.4 Category (Categoria)

- Sem mudança de modelo: usado para classificar receitas e despesas.

```ts
export type CategoryType = 'income' | 'expense'

export interface Category {
  id: string
  user_id: string
  name: string
  type: CategoryType
}
```

### 1.5 Goal (Meta)

- Pode permanecer como hoje (valor alvo vs valor atual) ou, em uma evolução futura, ser vinculada a uma conta ou a “patrimônio total”. Para esta proposta, mantemos a estrutura atual.

```ts
export interface Goal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
}
```

---

## 2. Relações entre entidades

- **User → Account:** 1:N. Um usuário tem várias contas.
- **Account → Transaction:** 1:N. Transações pertencem a uma conta e afetam o saldo dessa conta.
- **Account → Investment:** 1:N. Investimentos pertencem a uma conta. Apenas contas com `allows_investments === true` devem ter investimentos (validação de negócio).
- **Category → Transaction:** 1:N. Cada transação tem uma categoria.
- **User → Goal:** 1:N. Metas são do usuário; opcionalmente podem ser ligadas a conta ou “patrimônio” depois.

Resumo visual:

```
User
 ├── Account (várias)
 │    ├── Transaction (várias) → Category
 │    └── Investment (várias, se allows_investments)
 └── Goal (várias)
```

- **Integridade:** Todo `Investment.account_id` deve referenciar um `Account.id` existente. O saldo exibido “em contas” não soma o valor dos investimentos; investimentos entram apenas no bloco “Investimentos” e no patrimônio total.

---

## 3. Impacto nos cálculos do dashboard

O dashboard deve separar claramente:

1. **Saldo em contas (dinheiro em caixa)**  
   Soma do saldo atual de cada conta, calculado por:  
   `saldo_conta = initial_balance + Σ (receitas - despesas)` daquela conta.  
   Ou seja: continuar usando `getAccountBalance(account, transactions)` por conta e somar para todas as contas.  
   **Não** incluir aqui os valores de `Investment.current_amount`.

2. **Investimentos**  
   Soma de `Investment.current_amount` de todos os investimentos (opcionalmente agrupados por conta ou por tipo: renda fixa, variável, cripto).  
   - Total aplicado: `Σ invested_amount`  
   - Total atual: `Σ current_amount`

3. **Patrimônio total**  
   `patrimônio_total = saldo_em_contas + total_atual_investimentos`

Com o modelo refinado:

- **Saldo em contas** continua vindo apenas de `Account` + `Transaction` (sem duplicar valor de investimento).
- **Investimentos** passam a estar sempre atrelados a uma conta; o dashboard pode mostrar “por conta” ou “por tipo” sem mudar a fórmula do patrimônio.
- **Metas (Goal)** hoje usam `current_amount`; esse valor pode ser alimentado manualmente ou, no futuro, por “quanto está em conta X” ou “patrimônio total”, sem alterar o modelo de dados desta proposta.

---

## 4. Adaptação dos mocks

### 4.1 Accounts

- Adicionar `allows_investments` em cada conta.
- Exemplo: conta “Corrente” e “Poupança” com `allows_investments: false`; criar uma terceira conta “Corretora” ou “Investimentos” com `type: 'investment'` e `allows_investments: true` para concentrar os investimentos.

### 4.2 Investments

- Adicionar `account_id` apontando para a conta que “detém” o investimento (ex.: id da conta “Corretora”).
- Adicionar `type: InvestmentType` em cada item (`'fixed_income' | 'variable_income' | 'crypto'`).
- Opcional: `created_at`.

### 4.3 Transactions

- Sem mudança de estrutura; manter `account_id` referenciando apenas contas (não investimentos).

### 4.4 Categories e Goals

- Manter como estão; Goals continuam com `current_amount` e `target_amount` sem vínculo direto com conta/investimento nesta fase.

### 4.5 Validações sugeridas nos mocks

- Para todo `Investment`, garantir que `account_id` existe em `Account` e que `Account.allows_investments === true`.
- Ao exibir ou calcular, filtrar investimentos por `account_id` quando for preciso “investimentos da conta X”.

---

## 5. Próximos passos (implementação)

- Atualizar tipos em `src/types/` (Account, Investment).
- Atualizar `src/lib/balance.ts` se surgir necessidade de funções auxiliares (ex.: “saldo só de contas”, “total investimentos”).
- Ajustar mocks em `src/data/` conforme a seção 4.
- Dashboard: manter as três métricas (saldo em contas, investimentos, patrimônio total) usando as fórmulas acima; a UI não precisa mudar neste refinamento, apenas a origem dos dados (tipos e mocks).

Documento de referência para o modelo híbrido (contas + investimentos por conta) e para os cálculos do dashboard.
