import AddTransaction from "@/components/addTransactionButton";
import Category from "@/components/category";
import PageHeader from "@/components/common/Pageheader";
import TransactionsList from "@/components/transactions";

const Transactions = () => {
  return (
    <>
      <div className="flex justify-between mb-3">
        <PageHeader title="Transactions" />
        <AddTransaction />
      </div>
      <TransactionsList />
    </>
  );
};

export default Transactions;
