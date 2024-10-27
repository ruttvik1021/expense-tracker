// import { getTransactionById } from "@/ajax/transactionApi";
import { queryKeys } from "@/utils/queryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSourceById,
  getSources,
} from "../../../../server/actions/sources/sources";

export const useSources = () => {
  return useQuery({
    queryKey: [queryKeys.sources],
    queryFn: () => getSources(),
  });
};

export const useSourceById = (sourceId: string | null) => {
  const queryClient = useQueryClient();
  if (!sourceId) {
    queryClient.setQueryData([queryKeys.sources, sourceId], null);
  }
  return useQuery({
    queryKey: [queryKeys.sources, sourceId],
    queryFn: () => getSourceById(sourceId || ""),
    enabled: !!sourceId,
  });
};
