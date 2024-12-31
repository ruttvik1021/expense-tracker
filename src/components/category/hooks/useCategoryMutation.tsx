import { useAuthContext } from "@/components/wrapper/ContextWrapper";
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
  const { categoryFilter, transactionFilter } = useAuthContext();
  const queryClient = useQueryClient();

  const onSuccessFn = (message?: string) => {
    message && toast.success(message);
    queryClient.invalidateQueries({
      queryKey: [queryKeys.categories, categoryFilter],
      // refetchType: "none",
    });
    queryClient.invalidateQueries({
      queryKey: [queryKeys.transactions, transactionFilter],
      // refetchType: "none",
    });
  };

  const addCategory = useMutation({
    mutationFn: createCategory,
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      onSuccessFn(data.message);
    },
  });

  const deleteCategory = useMutation({
    mutationFn: deleteCategoryById,
    onSettled: (data) => {
      onSuccessFn(data?.message);
    },
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, values }: { id: string; values: CategoryFormValues }) =>
      updateCategoryById({ id, values }),
    onSuccess: (data) => {
      onSuccessFn(data.message);
    },
  });

  return { addCategory, deleteCategory, updateCategory };
};
