"use client";
import { queryKeys } from "@/utils/queryKeys";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import BaseBarGraph from "../baseCharts/baseBarChart";
import MonthYearPicker from "../common/MonthPicker";
import { useAuthContext } from "../wrapper/ContextWrapper";
import { FeatureRestrictedWarning } from "../alerts/EmailVerification";
import { getTop5TransactionsOfMonth } from "../../../server/actions/charts/charts";

const Top5TransactionsOfMonth = () => {
  const { isEmailVerified } = useAuthContext();
  const [month, setMonth] = React.useState(new Date());
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.top5TransactionsOfMonth, month],
    queryFn: () => getTop5TransactionsOfMonth({ month: month.toISOString() }),
  });

  return (
    <>
      {!isEmailVerified ? (
        <FeatureRestrictedWarning message="Verify email to see the charts" />
      ) : (
        <BaseBarGraph
          title={"Top 5 Transactions"}
          description={""}
          yAxisKey={"category"}
          xAxisKey={"amount"}
          tooltipKey={"spentOn"}
          chartData={data || []}
          isLoading={isLoading}
          filterContent={
            <>
              <MonthYearPicker
                handleMonthChange={(value) => setMonth(value)}
                date={month}
              />
            </>
          }
        />
      )}
    </>
  );
};

export default Top5TransactionsOfMonth;
