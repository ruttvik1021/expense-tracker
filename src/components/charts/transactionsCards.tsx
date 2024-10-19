"use client";
import { queryKeys } from "@/utils/queryKeys";
import { useQueries } from "@tanstack/react-query";
import React from "react";
import {
  getDailyTransactionSum,
  getMonthlyTransactionSum,
  getWeeklyTransactionSum,
} from "../../../server/actions/charts/charts";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Label } from "../ui/label";
import { WalletMinimalIcon } from "lucide-react";

const TransactionsCards = () => {
  const queries = useQueries({
    queries: [
      {
        queryKey: [queryKeys.transactionsThisMonth],
        queryFn: () => getMonthlyTransactionSum(),
      },
      {
        queryKey: [queryKeys.transactionThisWeek],
        queryFn: () => getWeeklyTransactionSum(),
      },
      {
        queryKey: [queryKeys.transactionsToday],
        queryFn: () => getDailyTransactionSum(),
      },
    ],
  });

  return (
    <div className="flex flex-wrap gap-5">
      {queries.map((query, index) => (
        <Card key={index} className="flex-1 min-w-[300px]">
          <CardHeader className="p-2">
            <Label className="flex gap-3 items-center text-xl font-bold">
              <WalletMinimalIcon />
              Transactions{" "}
              {index === 0 ? "This Month" : index === 1 ? "This Week" : "Today"}
            </Label>
          </CardHeader>
          <CardContent className="p-2">
            {query.isLoading ? (
              <div>Loading...</div>
            ) : query.isError ? (
              <div>Error loading data.</div>
            ) : (
              <Label className="text-xl font-bold">{query.data}</Label>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TransactionsCards;
