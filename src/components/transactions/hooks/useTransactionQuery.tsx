import { getTransactionById, getTransactionsApi } from "@/ajax/transactionApi";
import { queryKeys } from "@/utils/queryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useTransactions = (filter: Record<string, unknown>) => {
  return useQuery({
    queryKey: [queryKeys.transactions, filter],
    queryFn: () => getTransactionsApi(filter),
  });
};

export const useTransactionById = (transactionId: string | null) => {
  const queryClient = useQueryClient();
  if (!transactionId) {
    queryClient.setQueryData([queryKeys.transactions, transactionId], null);
  }
  return useQuery({
    queryKey: [queryKeys.transactions, transactionId],
    queryFn: () => getTransactionById(transactionId || ""),
    enabled: !!transactionId,
    staleTime: 0,
  });
};
