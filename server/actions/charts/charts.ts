import { getCategories } from "../category/category";
import { CategorySortBy } from "../category/schema";
import { TransactionSortBy } from "../transaction/schema";
import { getTransactions } from "../transaction/transaction";

export const getCategoriesForChart = async (
  categoryDate: Date,
  limit?: number
) => {
  const { categories } = await getCategories({
    categoryDate,
    sortBy: CategorySortBy.AMOUNT_SPENT,
    limit,
  });
  return { categories };
};

export const getTop5TransactionsOfMonth = async ({
  month,
  limit = 5,
}: {
  month: string;
  limit?: number;
}) => {
  const { transactions } = await getTransactions({
    month,
    sortBy: TransactionSortBy.AMOUNT,
    limit,
  });
  return (
    transactions
      ?.map((item) => {
        return {
          category: item.category.category,
          amount: item.amount,
          icon: item.category.icon,
          spentOn: item.spentOn,
        };
      })
      .filter((tran) => tran.amount > 0) || []
  );
};
