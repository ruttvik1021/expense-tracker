import { useQuery } from "@tanstack/react-query";
import { getProactiveInsights } from "@/ai/flows/proactive-insights";
import type { ProactiveInsightsOutput } from "@/ai/flows/proactive-insights";
import { queryKeys } from "@/utils/queryKeys";

type UseProactiveInsightsParams = {
  transactions: string;
  categories: string;
};

export function useProactiveInsights({
  transactions,
  categories,
}: UseProactiveInsightsParams) {
  return useQuery<ProactiveInsightsOutput>({
    queryKey: [queryKeys.proactiveInsights, transactions, categories],
    queryFn: () =>
      getProactiveInsights({
        currentMonthTransactions: JSON.stringify(transactions),
        currentMonthCategories: JSON.stringify(categories),
        lastMonthTransactions: "", // can be added later
      }),
    enabled: !!transactions && !!categories, // only fetch when data is available
    staleTime: 1000 * 60 * 60 * 24, // 1 day
  });
}
