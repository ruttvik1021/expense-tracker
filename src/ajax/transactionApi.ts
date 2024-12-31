import { ITransaction } from "@/utils/types/transactionTypes";
import { AjaxUtils } from "./ajax";
import { ITransactionFilter } from "@/components/wrapper/ContextWrapper";

export const createTransactionApi = (values: ITransaction) => {
  const url = "/transactions/add";
  return AjaxUtils.postAjax(url, values, true);
};

export const getTransactionsApi = (filter: Partial<ITransactionFilter>) => {
  const url = `/transactions`;
  return AjaxUtils.postAjax(url, filter, true);
};

export const deleteTransactionApi = (id: string) => {
  const url = "/transactions" + `/${id}`;
  return AjaxUtils.deleteAjax(url, true);
};

export const getTransactionById = (id: string) => {
  const url = "/transactions" + `/${id}`;
  return AjaxUtils.getAjax(url, true);
};

export const updateTransactionApi = (id: string, values: ITransaction) => {
  const url = "/transactions" + `/${id}`;
  return AjaxUtils.putAjax(url, values, true);
};

export const lastMonthTransactionsAmountApi = (values: { date: string }) => {
  const url = "/transactions/lastMonthTransactionsAmount";
  return AjaxUtils.postAjax(url, values, true);
};
