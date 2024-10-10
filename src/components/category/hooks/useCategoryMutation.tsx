import { queryKeys } from "@/utils/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCategory,
  deleteCategoryById,
  updateCategoryById,
} from "../../../../server/actions/category/category";
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
    mutationFn: createCategory,
    onSettled: (data) => {
      if (data?.error) {
        toast.error(data.error);
      } else if (data?.category) {
        onSuccessFn(data?.message || "");
      }
    },
  });

  const deleteCategory = useMutation({
    mutationKey: [queryKeys.deleteCategory],
    mutationFn: deleteCategoryById,
    onSettled: (data) => {
      if (data?.message) {
        onSuccessFn(data.message);
      }
    },
  });

  const updateCategory = useMutation({
    mutationKey: [queryKeys.mutateCategory],
    mutationFn: ({ id, values }: { id: string; values: CategoryFormValues }) =>
      updateCategoryById({ id, values }),
    onSuccess: (data) => {
      onSuccessFn(data.message);
    },
  });

  return { addCategory, deleteCategory, updateCategory };
};
