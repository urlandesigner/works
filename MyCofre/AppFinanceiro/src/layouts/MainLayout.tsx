import { Outlet } from 'react-router-dom'
import { clsx } from 'clsx'
import { Sidebar } from '../components/navigation/Sidebar'
import { MobileNavDrawer } from '../components/navigation/MobileNavDrawer'
import { AppHeader } from '../components/AppHeader'
import { TransactionsProvider } from '../contexts/TransactionsContext'
import { InvestmentsProvider } from '../contexts/InvestmentsContext'
import { AccountsProvider } from '../contexts/AccountsContext'
import { SubscriptionsProvider } from '../contexts/SubscriptionsContext'
import { GoalsProvider } from '../contexts/GoalsContext'
import { CreditCardsProvider } from '../contexts/CreditCardsContext'
import { CategoriesProvider } from '../contexts/CategoriesContext'
import { ValuesVisibilityProvider } from '../contexts/ValuesVisibilityContext'
import { HeaderActionsProvider } from '../contexts/HeaderActionsContext'
import { MobileMenuProvider } from '../contexts/MobileMenuContext'
import { UserProfileProvider } from '../contexts/UserProfileContext'
import { NavigationProgress } from '../components/NavigationProgress'
import { useHeaderActions } from '../contexts/HeaderActionsContext'

function MainLayoutShell() {
  const { mobileFab } = useHeaderActions()

  return (
    <>
      <NavigationProgress />
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar: apenas em desktop (md e acima) */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        {/* Menu mobile: drawer com overlay, visível só em mobile */}
        <MobileNavDrawer />
        <main
          id="conteudo-principal"
          role="main"
          aria-label="Conteúdo principal"
          className={clsx(
            'min-w-0 flex-1 overflow-auto pt-3 sm:pt-4 md:pt-5',
            mobileFab
              ? 'pb-[calc(max(1rem,env(safe-area-inset-bottom,0px))+5.25rem)] sm:pb-[calc(max(1.5rem,env(safe-area-inset-bottom,0px))+5.25rem)] md:pb-[max(2rem,env(safe-area-inset-bottom,0px))]'
              : 'pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] md:pb-[max(2rem,env(safe-area-inset-bottom,0px))]'
          )}
        >
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
            <div className="min-w-0 space-y-5">
              <AppHeader />
              <Outlet />
            </div>
          </div>
        </main>
        {mobileFab}
      </div>
    </>
  )
}

export function MainLayout() {
  return (
    <UserProfileProvider>
    <ValuesVisibilityProvider>
    <TransactionsProvider>
    <InvestmentsProvider>
    <AccountsProvider>
    <SubscriptionsProvider>
    <GoalsProvider>
    <CategoriesProvider>
    <CreditCardsProvider>
    <HeaderActionsProvider>
    <MobileMenuProvider>
    <MainLayoutShell />
    </MobileMenuProvider>
    </HeaderActionsProvider>
    </CreditCardsProvider>
    </CategoriesProvider>
    </GoalsProvider>
    </SubscriptionsProvider>
    </AccountsProvider>
    </InvestmentsProvider>
    </TransactionsProvider>
    </ValuesVisibilityProvider>
    </UserProfileProvider>
  )
}
