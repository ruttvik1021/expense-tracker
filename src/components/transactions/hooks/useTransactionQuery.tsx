// import { getTransactionById } from "@/ajax/transactionApi";
import { useAuthContext } from "@/components/wrapper/ContextWrapper";
import { queryKeys } from "@/utils/queryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTransactionById,
  getTransactions,
} from "../../../../server/actions/transaction/transaction";

export const useTransactions = () => {
  const { transactionFilter } = useAuthContext();
  return useQuery({
    queryKey: [queryKeys.transactions, transactionFilter],
    queryFn: () => getTransactions(transactionFilter),
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
  });
};
