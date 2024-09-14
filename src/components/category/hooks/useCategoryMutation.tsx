import {
  createCategoryApi,
  deleteCategoryApi,
  updateCategoryApi,
} from "@/ajax/categoryApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CategoryFormValues } from "../categoryForm";

export const useCategoryMutation = () => {
  const queryClient = useQueryClient();

  const addCategory = useMutation({
    mutationFn: createCategoryApi,
    onSuccess: (data) => {
      toast.success(data.data?.message);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => toast.error(error?.message),
  });

  const deleteCategory = useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: (data) => {
      toast.success(data.data?.message);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => toast.error(error?.message),
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, values }: { id: string; values: CategoryFormValues }) =>
      updateCategoryApi(id, values),
    onSuccess: (data) => {
      toast.success(data.data?.message);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => toast.error(error?.message),
  });

  return { addCategory, deleteCategory, updateCategory };
};
