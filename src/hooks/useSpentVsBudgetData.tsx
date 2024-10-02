import { useCategories } from "@/components/category/hooks/useCategoryQuery";
import { useTransactions } from "@/components/transactions/hooks/useTransactionQuery";

const useSpentVsBudgetData = (page: "Categories" | "Transactions") => {
  const { data } = page === "Categories" ? useCategories() : useTransactions();

  let totalBudget = 0;
  let totalSpent = 0;
  let isOverBudget = false;
  let percentageSpent = 0;

  if (page === "Categories") {
    totalBudget =
      data?.data?.categories.reduce(
        (acc: number, category: any) => acc + category.budget,
        0
      ) || 0;
    totalSpent =
      data?.data?.categories.reduce(
        (acc: number, category: any) => acc + category.totalAmountSpent,
        0
      ) || 0;
  } else {
    totalBudget = 0;
    totalSpent =
      data?.data?.transactions.reduce(
        (acc: number, transaction: any) => acc + transaction.amount,
        0
      ) || 0;
  }

  isOverBudget = totalSpent > totalBudget;
  percentageSpent = isOverBudget ? 100 : (totalSpent / totalBudget) * 100;

  return {
    totalBudget,
    totalSpent,
    isOverBudget,
    percentageSpent,
  };
};

export default useSpentVsBudgetData;
