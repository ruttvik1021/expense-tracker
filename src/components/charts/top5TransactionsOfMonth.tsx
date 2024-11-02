"use client";
import { queryKeys } from "@/utils/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { getTop5TransactionsOfMonth } from "../../../server/actions/charts/charts";
import { FeatureRestrictedWarning } from "../alerts/EmailVerification";
import BaseBarGraph from "../baseCharts/baseBarChart";
import { useAuthContext } from "../wrapper/ContextWrapper";

const Top5TransactionsOfMonth = ({ month }: { month: Date }) => {
  const { isEmailVerified } = useAuthContext();
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
          yAxisKey={"icon"}
          xAxisKey={"amount"}
          tooltipKey={"spentOn"}
          iconNameKey={"category"}
          chartData={data || []}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default Top5TransactionsOfMonth;
