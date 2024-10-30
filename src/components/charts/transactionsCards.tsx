"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/utils/queryKeys";
import { useQueries, useQuery } from "@tanstack/react-query";
import { ArrowDownIcon, ArrowUpIcon, WalletMinimalIcon } from "lucide-react";
import {
  getCurrentAndLastMonthTransactionSum,
  getCurrentAndLastWeekTransactionSum,
  getDailyAndYesterdayTransactionSum,
  getLastMonthSummaryData,
} from "../../../server/actions/charts/charts";

export default function TransactionsCards() {
  const { data: lastMonthSummary } = useQuery({
    queryKey: [queryKeys.lastMonthSummary],
    queryFn: () => getLastMonthSummaryData(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
  const queries = useQueries({
    queries: [
      {
        queryKey: [queryKeys.transactionsThisMonth],
        queryFn: () => getCurrentAndLastMonthTransactionSum(),
      },
      {
        queryKey: [queryKeys.transactionThisWeek],
        queryFn: () => getCurrentAndLastWeekTransactionSum(),
      },
      {
        queryKey: [queryKeys.transactionsToday],
        queryFn: () => getDailyAndYesterdayTransactionSum(),
      },
    ],
  });

  const getDifference = (prev: number, current: number) => {
    const difference = current - prev;
    return {
      isDecrease: difference < 0,
      difference: Math.abs(difference),
    };
  };

  const titles = ["Monthly", "Weekly", "Daily"];
  const comparisonTexts = ["last month", "last week", "yesterday"];

  return (
    <div className="flex flex-wrap gap-4">
      <Card className="flex-1 min-w-[250px]">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <WalletMinimalIcon />
            <h2 className="text-lg font-semibold">Last Month Summary</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">
                {lastMonthSummary?.totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-baseline space-x-2">
                <span className="text-md font-bold">Weekly Avg:</span>
                <span>
                  {lastMonthSummary?.weeklyAvg.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-md font-bold">Daily Avg:</span>
                <span>
                  {lastMonthSummary?.dailyAvg.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {queries.map((query, index) => {
        const { difference, isDecrease } = getDifference(
          query.data?.prev ?? 0,
          query.data?.current ?? 0
        );
        return (
          <Card key={index} className="flex-1 min-w-[250px]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <WalletMinimalIcon />
                <h2 className="text-lg font-semibold">
                  {titles[index]} Expense
                </h2>
              </div>

              {query.isLoading ? (
                <div>Loading...</div>
              ) : query.isError ? (
                <div>Error loading data.</div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold">
                      {query.data?.current.toLocaleString("en-IN")}
                    </span>
                    <span
                      className={cn("flex items-center text-xl font-medium", {
                        "text-green-500": isDecrease,
                        "text-red-500": !isDecrease,
                      })}
                    >
                      {isDecrease ? (
                        <ArrowDownIcon className="mr-1 h-4 w-4" />
                      ) : (
                        <ArrowUpIcon className="mr-1 h-4 w-4" />
                      )}
                      {difference.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-sm">
                    {isDecrease ? "Down" : "Up"} by{" "}
                    {difference.toLocaleString("en-IN")} compared to{" "}
                    {query.data?.prev.toLocaleString("en-IN")}{" "}
                    {comparisonTexts[index]}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
