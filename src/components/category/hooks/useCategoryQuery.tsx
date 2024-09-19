import { getCategoryApi, getCategoryById } from "@/ajax/categoryApi";
import { queryKeys } from "@/utils/queryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useCategories = () => {
  return useQuery({
    queryKey: [queryKeys.categories],
    queryFn: getCategoryApi,
  });
};

export const useCategoryById = (categoryId: string | null) => {
  const queryClient = useQueryClient();
  if (!categoryId) {
    queryClient.setQueryData([queryKeys.categories, categoryId], null);
  }
  return useQuery({
    queryKey: [queryKeys.categories, categoryId],
    queryFn: () => getCategoryById(categoryId || ""),
    enabled: !!categoryId,
    staleTime: 0,
  });
};
