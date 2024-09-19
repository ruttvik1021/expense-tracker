import {
  createTransactionApi,
  deleteTransactionApi,
  updateTransactionApi,
} from "@/ajax/transactionApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TransactionFormValues } from "../transactionForm";
import { queryKeys } from "@/utils/queryKeys";

export const useTransactionMutation = () => {
  const queryClient = useQueryClient();

  const onSucessFn = (message: string) => {
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: [queryKeys.transactions] });
    queryClient.invalidateQueries({ queryKey: [queryKeys.categories] });
  };

  const addTransaction = useMutation({
    mutationKey: [queryKeys.mutateTransaction],
    mutationFn: createTransactionApi,
    onSuccess: (data) => {
      onSucessFn(data.data?.message);
    },
    onError: (error) => toast.error(error?.message),
  });

  const deleteTransaction = useMutation({
    mutationKey: [queryKeys.deleteCategory],
    mutationFn: deleteTransactionApi,
    onSuccess: (data) => {
      onSucessFn(data.data?.message);
    },
    onError: (error) => toast.error(error?.message),
  });

  const updateTransaction = useMutation({
    mutationKey: [queryKeys.mutateTransaction],
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: TransactionFormValues;
    }) => updateTransactionApi(id, values),
    onSuccess: (data) => {
      onSucessFn(data.data?.message);
    },
    onError: (error) => toast.error(error?.message),
  });

  return { addTransaction, deleteTransaction, updateTransaction };
};
