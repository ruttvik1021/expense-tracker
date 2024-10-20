"use client";
import Top5CategoriesOfMonth from "@/components/charts/topCategoriesOfMonth";
import Top5TransactionsOfMonth from "@/components/charts/top5TransactionsOfMonth";
import PageHeader from "@/components/common/Pageheader";
import TransactionsCards from "@/components/charts/transactionsCards";
import { useAuthContext } from "@/components/wrapper/ContextWrapper";
import { FeatureRestrictedWarning } from "@/components/alerts/EmailVerification";

const Dashboard = () => {
  const { isEmailVerified } = useAuthContext();
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Top5CategoriesOfMonth />
            <Top5TransactionsOfMonth />
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
