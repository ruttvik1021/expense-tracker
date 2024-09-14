import { ITransaction } from "@/utils/types/transactionTypes";
import { AjaxUtils } from "./ajax";

export const createTransactionApi = (values: ITransaction) => {
  const url = "/transaction";
  return AjaxUtils.postAjax(url, values, true);
};

export const getTransactionsApi = () => {
  const url = "/transaction";
  return AjaxUtils.getAjax(url, true);
};

export const deleteTransactionApi = (id: string) => {
  const url = "/transaction" + `/${id}`;
  return AjaxUtils.deleteAjax(url, true);
};

export const getTransactionById = (id: string) => {
  const url = "/transaction" + `/${id}`;
  return AjaxUtils.getAjax(url, true);
};

export const updateTransactionApi = (id: string, values: ITransaction) => {
  const url = "/transaction" + `/${id}`;
  return AjaxUtils.putAjax(url, values, true);
};
