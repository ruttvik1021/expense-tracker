import { ICategory } from "@/utils/types/categoryTypes";
import { AjaxUtils } from "./ajax";
import { CategorySortBy } from "@/components/category";

export const createCategoryApi = (values: ICategory) => {
  const url = "/category";
  return AjaxUtils.postAjax(url, values, true);
};

export const getCategoryApi = ({
  categoryDate,
  sortBy,
}: {
  categoryDate: Date;
  sortBy: CategorySortBy;
}) => {
  const url =
    "/category" + `?date=${categoryDate.toISOString()}&sortBy=${sortBy}`;
  return AjaxUtils.getAjax(url, true);
};

export const deleteCategoryApi = (id: string) => {
  const url = "/category" + `/${id}`;
  return AjaxUtils.deleteAjax(url, true);
};

export const getCategoryById = (id: string) => {
  const url = "/category" + `/${id}`;
  return AjaxUtils.getAjax(url, true);
};

export const updateCategoryApi = (id: string, values: ICategory) => {
  const url = "/category" + `/${id}`;
  return AjaxUtils.putAjax(url, values, true);
};
