"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/utils/queryKeys";
import { useQueries, useQuery } from "@tanstack/react-query";
import { ArrowDownIcon, ArrowUpIcon, Wallet } from "lucide-react";
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

  return (
    <div className="flex flex-wrap gap-4">
      <Card className="flex-1 shadow-soft hover:shadow-medium transition-shadow animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Last Month
          </CardTitle>
          <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-success flex-shrink-0" />
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-xl sm:text-2xl font-bold text-success">
            {lastMonthSummary?.daysWithTransactions}
          </div>
        </CardContent>
      </Card>
      {queries.map((query, index) => {
        const { difference, isDecrease } = getDifference(
          query.data?.prev ?? 0,
          query.data?.current ?? 0
        );
        return (
          <Card
            className="flex-1 shadow-soft hover:shadow-medium transition-shadow animate-fade-in"
            key={index}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {titles[index]} Expense
              </CardTitle>
              <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-success flex-shrink-0" />
            </CardHeader>
            <CardContent className="pt-2">
              <div
                className={cn(
                  "text-xl sm:text-2xl font-bold text-success flex items-center",
                  {
                    "text-green-500": isDecrease,
                    "text-red-500": !isDecrease,
                  }
                )}
              >
                {isDecrease ? (
                  <ArrowDownIcon className="mr-1 h-4 w-4" />
                ) : (
                  <ArrowUpIcon className="mr-1 h-4 w-4" />
                )}
                {difference.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
