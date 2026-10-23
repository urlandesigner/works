import type { Account, Investment } from '../types'

const USER_ID = 'u1'
const NOW = new Date().toISOString()

/** Contas iniciais oferecidas pelo seed. Evitar duplicar por nome. Saldo inicial 0. */
export const SEED_ACCOUNTS: Omit<Account, 'id'>[] = [
  {
    user_id: USER_ID,
    name: 'Banco do Brasil',
    institution: 'Banco do Brasil',
    type: 'checking',
    initial_balance: 0,
    allows_investments: true,
    created_at: NOW,
    status: 'active',
    notes: null,
    include_in_net_worth: true,
  },
  {
    user_id: USER_ID,
    name: 'Itaú',
    institution: 'Itaú Unibanco',
    type: 'checking',
    initial_balance: 0,
    allows_investments: true,
    created_at: NOW,
    status: 'active',
    notes: null,
    include_in_net_worth: true,
  },
  {
    user_id: USER_ID,
    name: 'Caixa',
    institution: 'Caixa Econômica Federal',
    type: 'checking',
    initial_balance: 0,
    allows_investments: true,
    created_at: NOW,
    status: 'active',
    notes: null,
    include_in_net_worth: true,
  },
  {
    user_id: USER_ID,
    name: 'Cofrinho Davi',
    institution: null,
    type: 'savings',
    initial_balance: 0,
    allows_investments: true,
    created_at: NOW,
    status: 'active',
    notes: null,
    include_in_net_worth: true,
  },
]

/** Investimentos iniciais por conta. account_id preenchido na execução. Valor investido e atual 0. */
export const SEED_INVESTMENTS_BY_ACCOUNT: {
  accountName: string
  investment: Omit<Investment, 'id' | 'account_id'>
}[] = [
  {
    accountName: 'Banco do Brasil',
    investment: {
      user_id: USER_ID,
      name: 'FMP',
      type: 'fixed_income',
      invested_amount: 0,
      current_amount: 0,
      notes: null,
      institution: null,
      status: 'active',
    },
  },
  {
    accountName: 'Itaú',
    investment: {
      user_id: USER_ID,
      name: 'Ações da bolsa',
      type: 'variable_income',
      invested_amount: 0,
      current_amount: 0,
      notes: null,
      institution: null,
      status: 'active',
    },
  },
  {
    accountName: 'Itaú',
    investment: {
      user_id: USER_ID,
      name: 'Small Caps',
      type: 'variable_income',
      invested_amount: 0,
      current_amount: 0,
      notes: null,
      institution: null,
      status: 'active',
    },
  },
  {
    accountName: 'Caixa',
    investment: {
      user_id: USER_ID,
      name: 'Fundo pleno Caixa',
      type: 'fixed_income',
      invested_amount: 0,
      current_amount: 0,
      notes: null,
      institution: null,
      status: 'active',
    },
  },
  {
    accountName: 'Caixa',
    investment: {
      user_id: USER_ID,
      name: 'LCI Caixa',
      type: 'fixed_income',
      invested_amount: 0,
      current_amount: 0,
      notes: null,
      institution: null,
      status: 'active',
    },
  },
  {
    accountName: 'Caixa',
    investment: {
      user_id: USER_ID,
      name: 'Ações Caixa',
      type: 'variable_income',
      invested_amount: 0,
      current_amount: 0,
      notes: null,
      institution: null,
      status: 'active',
    },
  },
  {
    accountName: 'Cofrinho Davi',
    investment: {
      user_id: USER_ID,
      name: 'Bitcoin Picpay',
      type: 'crypto',
      invested_amount: 0,
      current_amount: 0,
      notes: null,
      institution: null,
      status: 'active',
    },
  },
]
