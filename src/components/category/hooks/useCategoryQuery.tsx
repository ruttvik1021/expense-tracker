import { getCategoryApi, getCategoryById } from "@/ajax/categoryApi";
import { useAuthContext } from "@/components/wrapper/ContextWrapper";
import { queryKeys } from "@/utils/queryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useCategories = () => {
  const { categoryFilter } = useAuthContext();
  return useQuery({
    queryKey: [queryKeys.categories, categoryFilter.categoryDate.toISOString()],
    queryFn: () => getCategoryApi(categoryFilter.categoryDate.toISOString()),
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
