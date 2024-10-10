export enum CategorySortBy {
  CATEGORY = "category",
  BUDGET = "budget",
  RECENT_TRANSACTIONS = "recentTransactions",
  AMOUNT_SPENT = "amountSpent",
}

export type CategorySchema = {
  category: string;
  icon: string;
  budget: number;
};
