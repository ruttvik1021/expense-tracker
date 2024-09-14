import { getCategoryById } from "@/ajax/categoryApi";
import { getTransactionsApi } from "@/ajax/transactionApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useTransactions = () => {
  return useQuery({ queryKey: ["transactions"], queryFn: getTransactionsApi });
};

export const useTransactionById = (transactionId: string | null) => {
  const queryClient = useQueryClient();
  if (!transactionId) {
    queryClient.setQueryData(["transaction", transactionId], null);
  }
  return useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: () => getCategoryById(transactionId || ""),
    enabled: !!transactionId,
    staleTime: 0,
  });
};
