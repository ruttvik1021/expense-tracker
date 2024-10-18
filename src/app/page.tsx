import Top5CategoriesOfMonth from "@/components/charts/top5CategoriesOfMonth";
import Top5TransactionsOfMonth from "@/components/charts/top5TransactionsOfMonth";
import PageHeader from "@/components/common/Pageheader";

export default function Home() {
  return (
    <>
      <PageHeader title={"Home"} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-3">
        <Top5CategoriesOfMonth />
        <Top5TransactionsOfMonth />
      </div>
    </>
  );
}
