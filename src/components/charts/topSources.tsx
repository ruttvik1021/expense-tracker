"use client";
import { queryKeys } from "@/utils/queryKeys";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { FeatureRestrictedWarning } from "../alerts/EmailVerification";
import MonthYearPicker from "../common/MonthPicker";
import { useAuthContext } from "../wrapper/ContextWrapper";

import BasePieGraph from "../baseCharts/basePieChart";
import { getCategoriesForChart } from "../../../server/actions/charts/charts";

const TopSources = () => {
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
          title={"Top Categories"}
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

export default TopSources;
