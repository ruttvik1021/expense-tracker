import dynamic from "next/dynamic";
const TransactionsList = dynamic(() => import("@/components/transactions"), {
  ssr: false,
});

const Transactions = () => {
  return (
    <>
      <TransactionsList />
    </>
  );
};

export default Transactions;
