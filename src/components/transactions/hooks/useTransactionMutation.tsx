// import {
//   createTransactionApi,
//   deleteTransactionApi,
//   updateTransactionApi,
// } from "@/ajax/transactionApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TransactionFormValues } from "../transactionForm";
import { queryKeys } from "@/utils/queryKeys";
import { useAuthContext } from "@/components/wrapper/ContextWrapper";
import {
  addTransactionFn,
  deleteTransactionFn,
  updateTransactionFn,
} from "../../../../server/actions/transaction/transaction";
// import { CategoryFormValues } from "@/components/category/categoryForm";
import { useCategories } from "@/components/category/hooks/useCategoryQuery";

export const useTransactionMutation = () => {
  const { categoryFilter, transactionFilter } = useAuthContext();
  const queryClient = useQueryClient();
  const { data } = useCategories();

  // const getCategory = (id: string) => {
  //   const category = data?.categories.find((item) => item._id === id);
  //   return {
  //     category: category?.category,
  //     _id: category?._id,
  //     icon: category?.icon,
  //   };
  // };

  const onSuccessFn = (message?: string) => {
    message && toast.success(message);
    queryClient.invalidateQueries({
      queryKey: [queryKeys.categories, categoryFilter],
      // refetchType: "none",
    });
    queryClient.invalidateQueries({
      queryKey: [queryKeys.transactions, transactionFilter],
      // refetchType: "none",
    });
  };
  const addTransaction = useMutation({
    mutationFn: addTransactionFn,

    onSuccess: (data) => {
      // queryClient.setQueryData(
      //   [queryKeys.transactions, transactionFilter],
      //   (prev: any) => {
      //     return {
      //       transactions: [
      //         {
      //           _id: data.transaction._id,
      //           date: data.transaction.createdAt,
      //           spentOn: data.transaction.spentOn,
      //           amount: data.transaction.amount,
      //           category: getCategory(data.transaction?.category),
      //         },
      //       ].concat(prev.transactions),
      //     };
      //   }
      // );
      onSuccessFn(data.message);
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: deleteTransactionFn,
    onSettled(data) {
      // queryClient.setQueryData(
      //   [queryKeys.transactions, transactionFilter],
      //   (prev: any) => {
      //     return {
      //       transactions: prev.transactions.filter(
      //         (transaction: any) => transaction._id.toString() !== data?.id
      //       ),
      //     };
      //   }
      // );
      // queryClient.removeQueries({
      //   queryKey: [queryKeys.category, data?.id],
      // });
      onSuccessFn(data?.message);
    },
  });

  const updateTransaction = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: TransactionFormValues;
    }) => updateTransactionFn({ id, values }),
    onSuccess: (data) => {
      // queryClient.invalidateQueries({
      //   queryKey: [queryKeys.transactions, transactionFilter],
      // });
      onSuccessFn(data.message);
    },
  });

  return { addTransaction, deleteTransaction, updateTransaction };
};
