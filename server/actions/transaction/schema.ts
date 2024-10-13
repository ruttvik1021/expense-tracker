export interface ITransaction {
  amount: number;
  category: string;
  date: string;
  spentOn: string;
}

export interface ITransactionFilter {
  month: string;
  categoryId: string;
  minAmount: number;
  maxAmount: number;
}
