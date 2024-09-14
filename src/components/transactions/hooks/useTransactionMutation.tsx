import {
  createTransactionApi,
  deleteTransactionApi,
  updateTransactionApi,
} from "@/ajax/transactionApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TransactionFormValues } from "../transactionForm";

export const useTransactionMutation = () => {
  const queryClient = useQueryClient();

  const addTransaction = useMutation({
    mutationFn: createTransactionApi,
    onSuccess: (data) => {
      toast.success(data.data?.message);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error) => toast.error(error?.message),
  });

  const deleteTransaction = useMutation({
    mutationFn: deleteTransactionApi,
    onSuccess: (data) => {
      toast.success(data.data?.message);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error) => toast.error(error?.message),
  });

  const updateTransaction = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: TransactionFormValues;
    }) => updateTransactionApi(id, values),
    onSuccess: (data) => {
      toast.success(data.data?.message);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error) => toast.error(error?.message),
  });

  return { addTransaction, deleteTransaction, updateTransaction };
};
