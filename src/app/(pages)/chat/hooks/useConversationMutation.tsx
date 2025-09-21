import { useAuthContext } from "@/components/wrapper/ContextWrapper";
import { queryKeys } from "@/utils/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createSavedConversation,
  updateSavedConversation,
  removeSavedConversation,
} from "../../../../../server/actions/conversations/conversations";

export const useConversationMutation = () => {
  const { user } = useAuthContext(); // If you want to scope cache by user
  const queryClient = useQueryClient();

  const onSuccessFn = (message?: string) => {
    if (message) toast.success(message);
    queryClient.invalidateQueries({
      queryKey: [queryKeys.savedConversations, user?.data.userId], // or just queryKeys.savedConversations if no user scoping
    });
  };

  const addSavedConversation = useMutation({
    mutationFn: createSavedConversation,
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      onSuccessFn(data.message);
    },
  });

  const updateSavedConversationMutation = useMutation({
    mutationFn: updateSavedConversation,
    onSuccess: (data) => {
      onSuccessFn(data.message);
    },
  });

  const deleteSavedConversation = useMutation({
    mutationFn: removeSavedConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.savedConversations], // or just queryKeys.savedConversations if no user scoping
      });
    },
    onSettled: (data) => {
      onSuccessFn(data?.message);
    },
  });

  return {
    addSavedConversation,
    updateSavedConversationMutation,
    deleteSavedConversation,
  };
};
