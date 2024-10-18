"use client";
import { queryKeys } from "@/utils/queryKeys";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { getTop5CategoriesOfMonth } from "../../../server/actions/category/category";
import BaseBarGraph from "../baseCharts/baseBarChart";
import MonthYearPicker from "../common/MonthPicker";
import { useAuthContext } from "../wrapper/ContextWrapper";
import { FeatureRestrictedWarning } from "../alerts/EmailVerification";

const Top5CategoriesOfMonth = () => {
  const { isEmailVerified } = useAuthContext();
  const [month, setMonth] = React.useState(new Date());
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.top5CategoriesOfMonth, month],
    queryFn: () => getTop5CategoriesOfMonth(month),
    enabled: isEmailVerified,
  });

  return (
    <>
      {!isEmailVerified ? (
        <FeatureRestrictedWarning message="Verify email to see the charts" />
      ) : (
        <BaseBarGraph
          title={"Top 5 Categories"}
          description={""}
          yAxisKey={"category"}
          xAxisKey={"amount"}
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
