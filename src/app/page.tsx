import Top5CategoriesOfMonth from "@/components/charts/topCategoriesOfMonth";
import Top5TransactionsOfMonth from "@/components/charts/top5TransactionsOfMonth";
import PageHeader from "@/components/common/Pageheader";
import TransactionsCards from "@/components/charts/transactionsCards";

export default function Home() {
  return (
    <>
      <PageHeader title={"Home"} />
      <div className="my-5">
        <TransactionsCards />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Top5CategoriesOfMonth />
        <Top5TransactionsOfMonth />
      </div>
    </>
  );
}
