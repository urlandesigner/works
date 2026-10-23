import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { RequireAuth } from '../layouts/RequireAuth'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { TransactionsLayout } from '../pages/transactions/TransactionsLayout'
import { TransactionFormModal } from '../pages/transactions/TransactionFormModal'
import { TransactionDetailPage } from '../pages/TransactionDetailPage'
import { AccountsLayout } from '../pages/accounts/AccountsLayout'
import { AccountDetailPage } from '../pages/AccountDetailPage'
import { AccountFormModal } from '../pages/accounts/AccountFormModal'
import { InvestmentsLayout } from '../pages/investments/InvestmentsLayout'
import { InvestmentFormModal } from '../pages/investments/InvestmentFormModal'
import { InvestmentDetailPage } from '../pages/InvestmentDetailPage'
import { SubscriptionsLayout } from '../pages/subscriptions/SubscriptionsLayout'
import { SubscriptionFormModal } from '../pages/subscriptions/SubscriptionFormModal'
import { SubscriptionDetailPage } from '../pages/SubscriptionDetailPage'
import { GoalsPage } from '../pages/GoalsPage'
import { NewGoalPage } from '../pages/NewGoalPage'
import { GoalDetailPage } from '../pages/GoalDetailPage'
import { EditGoalPage } from '../pages/EditGoalPage'
import { CreditCardsLayout } from '../pages/credit-cards/CreditCardsLayout'
import { CreditCardFormModal } from '../pages/credit-cards/CreditCardFormModal'
import { CreditCardDetailPage } from '../pages/credit-cards/CreditCardDetailPage'
import { ReportsPage } from '../pages/ReportsPage'
import { SettingsPage } from '../pages/SettingsPage'
import { ProfilePage } from '../pages/ProfilePage'
import { ImportStatementPage } from '../pages/ImportStatementPage'
import { ImportInvoicePage } from '../pages/ImportInvoicePage'
import { FinancialAssistantPage } from '../modules/financial-assistant/pages/FinancialAssistantPage'
import { FeatureRoute } from '../components/routing/FeatureRoute'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        element: <MainLayout />,
        children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      {
        path: 'transactions',
        element: <TransactionsLayout />,
        children: [
          { index: true, element: null },
          { path: 'new', element: <TransactionFormModal /> },
          { path: ':id/edit', element: <TransactionFormModal /> },
        ],
      },
      { path: 'transactions/:id', element: <TransactionDetailPage /> },
      {
        path: 'accounts',
        element: <AccountsLayout />,
        children: [
          { index: true, element: null },
          { path: 'new', element: <AccountFormModal /> },
          { path: ':id/edit', element: <AccountFormModal /> },
        ],
      },
      { path: 'accounts/:id', element: <AccountDetailPage /> },
      {
        path: 'investments',
        element: <InvestmentsLayout />,
        children: [
          { index: true, element: null },
          { path: 'new', element: <InvestmentFormModal /> },
          { path: ':id/edit', element: <InvestmentFormModal /> },
        ],
      },
      { path: 'investments/:id', element: <InvestmentDetailPage /> },
      {
        path: 'subscriptions',
        element: <SubscriptionsLayout />,
        children: [
          { index: true, element: null },
          { path: 'new', element: <SubscriptionFormModal /> },
          { path: ':id/edit', element: <SubscriptionFormModal /> },
        ],
      },
      { path: 'subscriptions/:id', element: <SubscriptionDetailPage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'goals/new', element: <NewGoalPage /> },
      { path: 'goals/:id', element: <GoalDetailPage /> },
      { path: 'goals/:id/edit', element: <EditGoalPage /> },
      {
        path: 'credit-cards',
        element: <CreditCardsLayout />,
        children: [
          { index: true, element: null },
          { path: 'new', element: <CreditCardFormModal /> },
          { path: ':id/edit', element: <CreditCardFormModal /> },
        ],
      },
      { path: 'credit-cards/:id', element: <CreditCardDetailPage /> },
      {
        path: 'reports',
        element: (
          <FeatureRoute flag="reports">
            <ReportsPage />
          </FeatureRoute>
        ),
      },
      {
        path: 'importar-extrato',
        element: (
          <FeatureRoute flag="import_statement">
            <ImportStatementPage />
          </FeatureRoute>
        ),
      },
      {
        path: 'faturas/importar',
        element: (
          <FeatureRoute flag="import_invoice">
            <ImportInvoicePage />
          </FeatureRoute>
        ),
      },
      {
        path: 'assistente-financeiro',
        element: (
          <FeatureRoute flag="assistant">
            <FinancialAssistantPage />
          </FeatureRoute>
        ),
      },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
], {
  // Publicação no works: a env var define a subpasta, sem afetar o deploy
  // normal (onde a env var não existe e o router fica na raiz).
  basename: import.meta.env.VITE_BASE_PATH || '/',
})
