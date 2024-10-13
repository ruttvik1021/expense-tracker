import { useCategories } from "@/components/category/hooks/useCategoryQuery";
import { useTransactions } from "@/components/transactions/hooks/useTransactionQuery";
import { queryKeys } from "@/utils/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../../server/actions/profile/profile";

export function formatNumber(num: number) {
  if (num >= 1000) {
    const rounded = Math.floor((num / 1000) * 10) / 10; // Floor to one decimal place
    return rounded % 1 === 0 ? `${rounded.toFixed(0)}K` : `${rounded}K`;
  }
  return num.toString(); // Return the number as a string for less than 1000
}

const useSpentVsBudgetData = (page: "Categories" | "Transactions") => {
  const { data: categoryData } = useCategories();
  const { data: userData } = useQuery({
    queryKey: [queryKeys.profile],
    queryFn: () => getProfile(),
  });
  const { data: transactionData } = useTransactions();

  let totalBudget = 0;
  let totalSpent = 0;
  let isOverBudget = false;
  let percentageSpent = 0;

  if (page === "Categories") {
    totalBudget = userData?.data ? userData?.data?.budget : 0;
    totalSpent =
      categoryData?.categories?.reduce(
        (acc: number, category: any) => acc + category.totalAmountSpent,
        0
      ) || 0;
  } else {
    totalBudget = 0;
    totalSpent =
      transactionData?.transactions?.reduce(
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
