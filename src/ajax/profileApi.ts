import { PasswordInitialValues } from "@/components/updatepassword";
import { AjaxUtils } from "./ajax";
// import { ProfileInitialValues } from "@/components/updateProfile";

export const updatePassword = (
  values: Omit<typeof PasswordInitialValues, "confirmNewPassword">
) => {
  const url = "/update-password";
  return AjaxUtils.postAjax(url, values, true);
};
