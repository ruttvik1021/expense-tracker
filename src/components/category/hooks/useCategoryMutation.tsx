import { queryKeys } from "@/utils/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCategory,
  deleteCategoryById,
  updateCategoryById,
} from "../../../../server/actions/category/category";
import { CategoryFormValues } from "../categoryForm";
import { CategoryDocument } from "@/models/CategoryModel";
import { useAuthContext } from "@/components/wrapper/ContextWrapper";

export const useCategoryMutation = () => {
  const { categoryFilter, transactionFilter } = useAuthContext();
  const queryClient = useQueryClient();

  const onSuccessFn = (message?: string) => {
    message && toast.success(message);
    queryClient.invalidateQueries({
      queryKey: [queryKeys.categories, categoryFilter],
      refetchType: "none",
    });
    queryClient.invalidateQueries({
      queryKey: [queryKeys.transactions, transactionFilter],
      refetchType: "none",
    });
  };

  const addCategory = useMutation({
    mutationFn: createCategory,
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      queryClient.setQueryData(
        [queryKeys.categories, categoryFilter],
        (prev: any) => {
          return {
            categories: [data.category].concat(prev.categories),
          };
        }
      );
      onSuccessFn(data.message);
    },
  });

  const deleteCategory = useMutation({
    mutationFn: deleteCategoryById,
    onSettled: (data) => {
      queryClient.setQueryData(
        [queryKeys.categories, categoryFilter],
        (prev: any) => {
          return {
            categories: prev.categories.filter(
              (category: any) => category._id.toString() !== data?.id
            ),
          };
        }
      );
      // queryClient.setQueryData(
      //   [queryKeys.transactions, transactionFilter],
      //   (prev: any) => {
      //     return {
      //       transactions: prev.transactions.filter(
      //         (transaction: any) =>
      //           transaction.category._id.toString() !== data?.id
      //       ),
      //     };
      //   }
      // );
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
