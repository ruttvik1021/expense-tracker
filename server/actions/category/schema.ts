export enum CategorySortBy {
  CATEGORY = "category",
  BUDGET = "budget",
  RECENT_TRANSACTIONS = "recentTransactions",
  AMOUNT_SPENT = "amountSpent",
}

export enum PeriodType {
  ONCE = "once",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  HALF_YEARLY = "half-yearly",
  ANNUALLY = "annually",
}

export enum CategoryCreationDuration {
  NEXT_12_MONTHS = "next12Months",
  YEAR_END = "yearEnd",
}
export type CategorySchema = {
  category: string;
  icon: string;
  budget: number;
  periodType: PeriodType;
  startMonth: number;
  creationDuration: CategoryCreationDuration;
};

export interface ICategoryInstance {
  periodType: PeriodType; // Specify the period types
  startMonth: number; // Assuming startMonth is a Date object
  userId: string; // User ID as a string
  _id: string; // Category ID as a string
  creationDuration: CategoryCreationDuration; // User's choice for creation duration
}
