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

export const useTransactionMutation = () => {
  const { categoryFilter, transactionFilter } = useAuthContext();
  const queryClient = useQueryClient();

  const onSuccessFn = (message?: string) => {
    message && toast.success(message);
    queryClient.invalidateQueries({
      queryKey: [queryKeys.categories, categoryFilter],
    });
    queryClient.invalidateQueries({
      queryKey: [queryKeys.transactions, transactionFilter],
    });

    queryClient.invalidateQueries({
      queryKey: [queryKeys.transactionsThisMonth],
      refetchType: "none",
    });

    queryClient.invalidateQueries({
      queryKey: [queryKeys.transactionThisWeek],
      refetchType: "none",
    });

    queryClient.invalidateQueries({
      queryKey: [queryKeys.transactionsToday],
      refetchType: "none",
    });
  };

  const addTransaction = useMutation({
    mutationFn: addTransactionFn,

    onSuccess: (data) => {
      onSuccessFn(data.message);
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: deleteTransactionFn,
    onSettled(data) {
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
      onSuccessFn(data.message);
    },
  });

  return { addTransaction, deleteTransaction, updateTransaction };
};
