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
      queryClient.setQueryData(
        [queryKeys.category, data.category?._id],
        data.category
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
      queryClient.removeQueries({
        queryKey: [queryKeys.category, data?.id],
      });
      onSuccessFn(data?.message);
    },
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, values }: { id: string; values: CategoryFormValues }) =>
      updateCategoryById({ id, values }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        [queryKeys.categories, categoryFilter],
        (prev: any) => {
          return {
            categories: prev.categories.map((category: any) => {
              if (category._id.toString() === data.category._id) {
                return {
                  ...category,
                  category: data.category.category,
                  icon: data.category.icon,
                  budget: data.category.budget,
                };
              }
              return category;
            }),
          };
        }
      );
      queryClient.setQueryData([queryKeys.category, data.category?._id], {
        ...data.category,
        category: data.category.category,
        icon: data.category.icon,
        budget: data.category.budget,
      });
      onSuccessFn(data.message);
    },
  });

  return { addCategory, deleteCategory, updateCategory };
};
