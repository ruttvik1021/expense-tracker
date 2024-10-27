import { queryKeys } from "@/utils/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createSource,
  removeSource,
  updateSource,
} from "../../../../server/actions/sources/sources";

export const useSourceMutation = () => {
  const queryClient = useQueryClient();

  const onSuccessFn = (message?: string) => {
    if (message) toast.success(message);

    queryClient.invalidateQueries({
      queryKey: [queryKeys.sources],
    });
  };

  const addSource = useMutation({
    mutationFn: createSource,
    onSuccess: (data) => {
      onSuccessFn(data?.message);
    },
  });

  const deleteSource = useMutation({
    mutationFn: removeSource,
    onSettled: (data) => {
      onSuccessFn(data?.message);
    },
  });

  const editSource = useMutation({
    mutationFn: ({ id, source }: { id: string; source: string }) =>
      updateSource(id, source),
    onSuccess: (data) => {
      onSuccessFn(data?.message);
    },
  });

  return { addSource, deleteSource, editSource };
};
