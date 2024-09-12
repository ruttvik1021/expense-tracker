import Category from "@/components/category";
import PageHeader from "@/components/common/Pageheader";
import TransactionsList from "@/components/transactions";

const Transactions = () => {
  return (
    <>
      <div className="flex justify-between items-center">
        <PageHeader title="Transactions" />
        <TransactionsList />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Category />
      </div>
    </>
  );
};

export default Transactions;
