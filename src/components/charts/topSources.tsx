"use client";
import { queryKeys } from "@/utils/queryKeys";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { FeatureRestrictedWarning } from "../alerts/EmailVerification";
import MonthYearPicker from "../common/MonthPicker";
import { useAuthContext } from "../wrapper/ContextWrapper";

import { getTransactions } from "../../../server/actions/transaction/transaction";
import BaseBarGraph from "../baseCharts/baseBarChart";

const TopSources = () => {
  const { isEmailVerified } = useAuthContext();
  const [month, setMonth] = React.useState(new Date());
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.transactions, { month: month.toISOString() }],
    queryFn: () => getTransactions({ month: month.toISOString() }),
  });

  const groupedTotals = data?.transactions.reduce((acc, json) => {
    const source = json.source?.source || "Other";
    const amount = json.amount;

    if (!acc[source]) {
      acc[source] = 0;
    }
    acc[source] += amount;
    return acc;
  }, {});

  const result = groupedTotals
    ? Object.keys(groupedTotals)?.map((source) => ({
        group: source,
        amount: groupedTotals[source],
      }))
    : [];

  return (
    <>
      {!isEmailVerified ? (
        <FeatureRestrictedWarning message="Verify email to see the charts" />
      ) : (
        <BaseBarGraph
          title={"Method Wise"}
          description={""}
          yAxisKey={"group"}
          xAxisKey={"amount"}
          tooltipKey={""}
          iconNameKey={""}
          chartData={result || []}
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

export default TopSources;
