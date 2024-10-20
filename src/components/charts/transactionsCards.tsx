"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/utils/queryKeys";
import { useQueries } from "@tanstack/react-query";
import { ArrowDownIcon, ArrowUpIcon, WalletMinimalIcon } from "lucide-react";
import {
  getCurrentAndLastMonthTransactionSum,
  getCurrentAndLastWeekTransactionSum,
  getDailyAndYesterdayTransactionSum,
} from "../../../server/actions/charts/charts";

export default function TransactionsCards() {
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
      {queries.map((query, index) => {
        const { difference, isDecrease } = getDifference(
          query.data?.prev ?? 0,
          query.data?.current ?? 0
        );
        return (
          <Card
            key={index}
            className="flex-1 min-w-[250px]"
          >
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
                      {query.data?.current.toFixed(0)}
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
                      {difference.toFixed(0)}
                    </span>
                  </div>
                  <p className="text-sm">
                    {isDecrease ? "Down" : "Up"} by {difference.toFixed(0)}{" "}
                    compared to {query.data?.prev.toFixed(0)}{" "}
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
