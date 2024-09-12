import React from "react";
import AddTransaction from "../addTransactionButton";

const TransactionsList = () => {
  return (
    <div>
      <div className="flex justify-end">
        <AddTransaction />
      </div>
    </div>
  );
};

export default TransactionsList;
