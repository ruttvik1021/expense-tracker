"use client";
import { queryKeys } from "@/utils/queryKeys";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { FeatureRestrictedWarning } from "../alerts/EmailVerification";
import MonthYearPicker from "../common/MonthPicker";
import { useAuthContext } from "../wrapper/ContextWrapper";

import { getCategoriesForChart } from "../../../server/actions/charts/charts";
import BasePieGraph from "../baseCharts/basePieChart";

const Top5CategoriesOfMonth = () => {
  const { isEmailVerified } = useAuthContext();
  const [month, setMonth] = React.useState(new Date());
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.categories, month],
    queryFn: () => getCategoriesForChart(month),
    enabled: isEmailVerified,
  });

  return (
    <>
      {!isEmailVerified ? (
        <FeatureRestrictedWarning message="Verify email to see the charts" />
      ) : (
        <BasePieGraph
          title={"Category Wise"}
          description={""}
          labelKey={"category"}
          valueKey={"totalAmountSpent"}
          chartData={data?.categories || []}
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
