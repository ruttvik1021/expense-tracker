import { PasswordInitialValues } from "@/components/updatepassword";
import { AjaxUtils } from "./ajax";

export const updatePassword = (
  values: Omit<typeof PasswordInitialValues, "confirmNewPassword">
) => {
  const url = "/update-password";
  return AjaxUtils.postAjax(url, values, true);
};
