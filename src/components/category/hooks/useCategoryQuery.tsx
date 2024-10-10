import { useAuthContext } from "@/components/wrapper/ContextWrapper";
import { queryKeys } from "@/utils/queryKeys";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getCategories,
  getCategoryById,
} from "../../../../server/actions/category/category";

export const useCategories = () => {
  const { categoryFilter } = useAuthContext();
  return useQuery({
    queryKey: [queryKeys.categories, categoryFilter],
    queryFn: () => getCategories(categoryFilter),
    placeholderData: keepPreviousData,
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
  });
};
