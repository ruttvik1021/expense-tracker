import { useCategories } from "@/components/category/hooks/useCategoryQuery";

const useSpentVsBudgetData = () => {
  const { data } = useCategories();
  const totalBudget =
    data?.data?.categories.reduce(
      (acc: number, category: any) => acc + category.budget,
      0
    ) || 0;
  const totalSpent =
    data?.data?.categories.reduce(
      (acc: number, category: any) => acc + category.totalAmountSpent,
      0
    ) || 0;

  const isOverBudget = totalSpent > totalBudget;
  const percentageSpent = isOverBudget ? 100 : (totalSpent / totalBudget) * 100;
  return {
    totalBudget,
    totalSpent,
    isOverBudget,
    percentageSpent,
  };
};

export default useSpentVsBudgetData;
