export interface ITransaction {
  amount: number;
  category: string;
  date: string;
  spentOn: string;
}

export enum TransactionSortBy {
  AMOUNT = "amount",
}

export interface ITransactionFilter {
  month: string;
  categoryId: string;
  minAmount: number;
  maxAmount: number;
  sortBy?: TransactionSortBy;
  limit?: number;
}
