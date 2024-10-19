"use client";
import { queryKeys } from "@/utils/queryKeys";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { getTop5CategoriesOfMonth } from "../../../server/actions/category/category";
import { FeatureRestrictedWarning } from "../alerts/EmailVerification";
import MonthYearPicker from "../common/MonthPicker";
import { useAuthContext } from "../wrapper/ContextWrapper";

import { ChartConfig } from "@/components/ui/chart";
import BasePieGraph from "../baseCharts/basePieChart";

const Top5CategoriesOfMonth = () => {
  const { isEmailVerified } = useAuthContext();
  const [month, setMonth] = React.useState(new Date());
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.top5CategoriesOfMonth, month],
    queryFn: () => getTop5CategoriesOfMonth(month),
    enabled: isEmailVerified,
  });

  const chartConfig = {} satisfies ChartConfig;

  const totalVisitors = React.useMemo(() => {
    return data?.reduce((acc, curr) => acc + curr.amount, 0);
  }, []);

  return (
    <>
      {!isEmailVerified ? (
        <FeatureRestrictedWarning message="Verify email to see the charts" />
      ) : (
        <BasePieGraph
          title={"Top 5 Categories"}
          description={""}
          labelKey={"category"}
          valueKey={"amount"}
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

export default Top5CategoriesOfMonth;
