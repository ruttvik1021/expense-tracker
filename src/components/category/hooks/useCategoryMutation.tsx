import {
  createCategoryApi,
  deleteCategoryApi,
  updateCategoryApi,
} from "@/ajax/categoryApi";
import { queryKeys } from "@/utils/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CategoryFormValues } from "../categoryForm";

export const useCategoryMutation = () => {
  const queryClient = useQueryClient();

  const onSuccessFn = (message: string) => {
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: [queryKeys.categories] });
    queryClient.invalidateQueries({ queryKey: [queryKeys.transactions] });
  };

  const addCategory = useMutation({
    mutationKey: [queryKeys.mutateCategory],
    mutationFn: createCategoryApi,
    onSuccess: (data) => {
      onSuccessFn(data.data?.message);
    },
    onError: (error) => toast.error(error?.message),
  });

  const deleteCategory = useMutation({
    mutationKey: [queryKeys.deleteCategory],
    mutationFn: deleteCategoryApi,
    onSuccess: (data) => {
      onSuccessFn(data.data?.message);
    },
    onError: (error) => toast.error(error?.message),
  });

  const updateCategory = useMutation({
    mutationKey: [queryKeys.mutateCategory],
    mutationFn: ({ id, values }: { id: string; values: CategoryFormValues }) =>
      updateCategoryApi(id, values),
    onSuccess: (data) => {
      onSuccessFn(data.data?.message);
    },
    onError: (error) => toast.error(error?.message),
  });

  return { addCategory, deleteCategory, updateCategory };
};
