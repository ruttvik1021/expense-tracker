import { ILogin, IRegister } from "@/utils/types/authTypes";
import { AjaxUtils } from "./ajax";

export const loginApi = (values: ILogin) => {
  const url = "/login";
  return AjaxUtils.postAjax(url, values, false);
};

export const signUpApi = (values: IRegister) => {
  const url = "/register";
  return AjaxUtils.postAjax(url, values, false);
};
