import { useQuery } from "@tanstack/react-query";
import { getProactiveInsights } from "@/ai/flows/proactive-insights";
import type { ProactiveInsightsOutput } from "@/ai/flows/proactive-insights";
import { queryKeys } from "@/utils/queryKeys";

type UseProactiveInsightsParams = {
  transactions: string;
  categories: string;
  budget: string;
};

export function useProactiveInsights({
  transactions,
  categories,
  budget,
}: UseProactiveInsightsParams) {
  return useQuery<ProactiveInsightsOutput>({
    queryKey: [queryKeys.proactiveInsights, transactions, categories, budget],
    queryFn: () =>
      getProactiveInsights({
        currentMonthTransactions: transactions,
        currentMonthCategories: categories,
        lastMonthTransactions: "", // can be added later
        budget: budget || "0",
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
