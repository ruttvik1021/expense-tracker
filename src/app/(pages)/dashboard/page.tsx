"use client";
import { FeatureRestrictedWarning } from "@/components/alerts/EmailVerification";
import Top5TransactionsOfMonth from "@/components/charts/top5TransactionsOfMonth";
import Top5CategoriesOfMonth from "@/components/charts/topCategoriesOfMonth";
import TopSources from "@/components/charts/topSources";
import TransactionsCards from "@/components/charts/transactionsCards";
import MonthYearPicker from "@/components/common/MonthPicker";
import PageHeader from "@/components/common/Pageheader";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/components/wrapper/ContextWrapper";
import { useState } from "react";

const Dashboard = () => {
  const { isEmailVerified } = useAuthContext();
  const [month, setMonth] = useState(new Date());
  return (
    <>
      <PageHeader title={"Home"} />
      {!isEmailVerified ? (
        <FeatureRestrictedWarning message="Verify email to see the charts" />
      ) : (
        <>
          <div className="my-5">
            <TransactionsCards />
          </div>
          <div className="flex justify-between items-center mb-5">
            <Label>Showing data for </Label>

            <MonthYearPicker
              handleMonthChange={(value) => setMonth(value)}
              date={month}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <TopSources month={month} />
            <Top5CategoriesOfMonth month={month} />
            <Top5TransactionsOfMonth month={month} />
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
