import { queryKeys } from "@/utils/queryKeys";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getSavedConversationById,
  getSavedConversations,
} from "../../../../../server/actions/conversations/conversations";

export const useGetConversations = () => {
  return useQuery({
    queryKey: [queryKeys.savedConversations], // or just queryKeys.savedConversations
    queryFn: () => getSavedConversations(),
    placeholderData: keepPreviousData,
  });
};

export const useGetConversationById = (conversationId: string | null) => {
  const queryClient = useQueryClient();

  if (!conversationId) {
    queryClient.setQueryData(
      [queryKeys.savedConversations, conversationId],
      null
    );
  }

  return useQuery({
    queryKey: [queryKeys.savedConversations, conversationId],
    queryFn: () => getSavedConversationById(conversationId || ""),
    enabled: !!conversationId,
  });
};
