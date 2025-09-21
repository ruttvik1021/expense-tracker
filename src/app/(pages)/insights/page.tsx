"use client";

import { useCategories } from "@/components/category/hooks/useCategoryQuery";
import { useTransactions } from "@/components/transactions/hooks/useTransactionQuery";
import { CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useProactiveInsights } from "./useProactiveInsights";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/utils/queryKeys";
import { getProfile } from "../../../../server/actions/profile/profile";
import PageHeader from "@/components/common/Pageheader";

export const maxDuration = 60; // Timeout in seconds

export default function InsightsPage() {
  const { data: transactions, isLoading: isTransactionsPending } =
    useTransactions();
  const { data: categories, isLoading: isCategoriesPending } = useCategories();
  const allTransactions = transactions?.transactions || [];
  const allCategories = categories?.categories || [];
  const { data: userData, isLoading: isUserDataPending } = useQuery({
    queryKey: [queryKeys.profile],
    queryFn: () => getProfile(),
  });

  const currentMonthTransactionData = allTransactions
    .slice() // clone the array to avoid mutating original
    .sort((a, b) => a.spentOn.localeCompare(b.spentOn)) // sort by `spentOn` (name)
    .map((t) => `${t.amount}|${t.spentOn}|${t.date.split("T")[0]}`)
    .join("\n");

  const currentMonthCategoryData = allCategories
    .slice()
    .sort((a, b) => a.category.localeCompare(b.category)) // sort by `category` (name)
    .map((t) => `${t.category}|${t.budget}`)
    .join("\n");

  const { data: insights, isLoading: isInsightsPending } = useProactiveInsights(
    {
      transactions: currentMonthTransactionData,
      categories: currentMonthCategoryData,
      budget: String(userData?.data?.budget),
      isBudgetLoading: isUserDataPending,
    }
  );

  const isLoading =
    isTransactionsPending ||
    isCategoriesPending ||
    isUserDataPending ||
    isInsightsPending;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-1 flex-col gap-4 p-2 md:gap-8 md:p-2">
        <PageHeader
          children={
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle>Your Proactive Financial Insights</CardTitle>
            </div>
          }
        />
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">
              Analyzing your financial data...
            </p>
          </div>
        ) : !insights ? (
          <div className="flex justify-center items-center py-10">
            <p>Could not load insights at this time.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Spending Summary */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Spending Summary</h3>
              <p>
                <ReactMarkdown>{insights.spendingSummary}</ReactMarkdown>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
