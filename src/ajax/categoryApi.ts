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
