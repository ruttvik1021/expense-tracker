import { getCategoryApi, getCategoryById } from "@/ajax/categoryApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useCategories = () => {
  return useQuery({ queryKey: ["categories"], queryFn: getCategoryApi });
};

export const useCategoryById = (categoryId: string | null) => {
  if (!categoryId) {
    useQueryClient().setQueryData(["category", categoryId], null);
  }
  return useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => getCategoryById(categoryId || ""),
    enabled: !!categoryId,
    staleTime: 0,
  });
};
