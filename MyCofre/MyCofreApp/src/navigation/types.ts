import type { TransactionType } from '../shared/types/transaction';

export type RootTabParamList = {
  Home: undefined;
  Notifications: undefined;
  More: undefined;
  Accounts: { openForm?: boolean } | undefined;
  CreditCards: undefined;
  Investments: undefined;
  MonthlyClosing: undefined;
  Reports: undefined;
  Subscriptions: undefined;
  Settings: undefined;
  Transactions:
    | {
        openForm?: boolean;
        initialType?: TransactionType;
        initialCategoryId?: string;
        initialAccountId?: string;
      }
    | undefined;
  Goals: { openForm?: boolean } | undefined;
  Wealth: undefined;
  Profile: undefined;
};
