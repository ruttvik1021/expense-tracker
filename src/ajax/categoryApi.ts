import { ICategory } from "@/utils/types/categoryTypes";
import { AjaxUtils } from "./ajax";

export const createCategoryApi = (values: ICategory) => {
  const url = "/category";
  return AjaxUtils.postAjax(url, values, true);
};

export const getCategoryApi = () => {
  const url = "/category";
  return AjaxUtils.getAjax(url, true);
};

export const deleteCategoryApi = (id: String) => {
  const url = "/category" + `/${id}`;
  return AjaxUtils.deleteAjax(url, true);
};
