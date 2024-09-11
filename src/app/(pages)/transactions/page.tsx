import AddTransaction from "@/components/addTransactionButton";
import PageHeader from "@/components/common/Pageheader";

const Transactions = () => {
  return (
    <div className="flex justify-between items-center">
      <PageHeader title="Transactions" />
      <AddTransaction />
    </div>
  );
};

export default Transactions;
