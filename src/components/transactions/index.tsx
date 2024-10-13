"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useSpentVsBudgetData from "@/hooks/useSpentVsBudgetData";
import { IndianRupee } from "lucide-react";
import moment from "moment";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useCategories } from "../category/hooks/useCategoryQuery";
import PageHeader from "../common/Pageheader";
import CustomAddIcon from "../icons/customAddIcon";
import CustomDeleteIcon from "../icons/customDeleteIcon";
import CustomEditIcon from "../icons/customEditIcon";
import ResponsiveDialogAndDrawer from "../responsiveDialogAndDrawer";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { useAuthContext } from "../wrapper/ContextWrapper";
import { useTransactionMutation } from "./hooks/useTransactionMutation";
import {
  useTransactionById,
  useTransactions,
} from "./hooks/useTransactionQuery";
import { TransactionFormSkeleton } from "./skeleton";
import TransactionFilters from "./transactionFilters";
import TransactionForm, {
  transactionFormInitialValues,
} from "./transactionForm";

const groupTransactionsBy = [
  { label: "Table", value: "none" },
  { label: "Category", value: "category" },
];

const Transactions = () => {
  const [groupBy, setGroupBy] = useState(groupTransactionsBy[0].value);
  const { categoryFilter, transactionFilter } = useAuthContext();
  const searchParams = useSearchParams();
  const addBycategoryId = searchParams.get("addBycategory") || "";
  const navigate = searchParams.get("navigate") || "";
  const categoryDate = categoryFilter.categoryDate;
  const { data: categoryList } = useCategories();
  const router = useRouter();
  const { data } = useTransactions();
  const filteredCategory = categoryList?.categories?.find(
    (category: any) => category._id === transactionFilter.categoryId
  )?.category;
  const { deleteTransaction } = useTransactionMutation();
  const [open, setOpen] = useState<{
    type: "ADD" | "EDIT" | "DELETE";
    open: boolean;
  }>(
    addBycategoryId
      ? {
          type: "ADD",
          open: true,
        }
      : {
          type: "ADD",
          open: false,
        }
  );
  const [transactionToEdit, setTransactionToEdit] = useState<string>("");
  const [transactionToDelete, setTransactionToDelete] = useState<string>("");

  const { data: transactionData, isLoading: gettingTransactionById } =
    useTransactionById(transactionToEdit || "");

  const initialValues = {
    ...transactionFormInitialValues,
    amount: transactionData?.data.amount || 0,
    category: transactionData?.data.category || addBycategoryId || "",
    spentOn: transactionData?.data.spentOn || "",
    date:
      transactionData?.data.date ||
      moment(categoryDate).format() ||
      moment().format(),
  };

  const handleDeleteTransaction = async () => {
    await deleteTransaction.mutateAsync(transactionToDelete!);
    handleClose();
  };

  const handleClose = () => {
    setTransactionToEdit("");
    setTransactionToDelete("");
    setOpen({ type: "ADD", open: false });
    navigate && router.push(navigate);
  };

  const { totalSpent } = useSpentVsBudgetData("Transactions");

  const groupedTransactions = data?.transactions.reduce(
    (groups: { [key: string]: any[] }, transaction: any) => {
      const group =
        groupBy === "date" ? transaction.date : transaction.category.category;
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(transaction);
      return groups;
    },
    {}
  );

  return (
    <>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <PageHeader title={`${filteredCategory || ""} Transactions`} />

          <div className="flex items-center gap-2">
            <TransactionFilters />
            <CustomAddIcon
              onClick={() => {
                setOpen({ type: "ADD", open: true });
              }}
            />
          </div>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Select onValueChange={setGroupBy} value={groupBy}>
            <SelectTrigger id="groupBy" className="sm:w-full sm:max-w-[180px]">
              <SelectValue placeholder="Group Transactions by" />
            </SelectTrigger>
            <SelectContent>
              {groupTransactionsBy.map(
                (groupBy: { label: string; value: string }) => (
                  <SelectItem key={groupBy.value} value={groupBy.value}>
                    {groupBy.label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div
        className={"flex items-center text-foreground text-sm font-semibold"}
      >
        Overall spending for this month is:{" "}
        <p className="flex items-center mx-2">
          {" "}
          <IndianRupee className="icon" />{" "}
          <span className="font-bold text-lg">{totalSpent}</span>
        </p>
      </div>
      <Separator />
      {groupBy !== "none" ? (
        groupedTransactions &&
        Object.keys(groupedTransactions).map((group) => (
          <>
            <div key={group} className="mb-6">
              <h2 className="text-md my-2 font-bold text-selected">
                {groupBy === "date" ? (
                  moment(group).utc().format("DD/MM/YYYY")
                ) : (
                  <h2 className="flex items-center gap-2 text-md font-bold">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {groupedTransactions[group][0].category?.icon}
                      </AvatarFallback>
                    </Avatar>
                    {group}
                  </h2>
                )}
              </h2>
              <Card className="w-full shadow-none border-none">
                <CardContent className="p-0">
                  {groupedTransactions[group].map(
                    (transaction: any, index: number) => (
                      <>
                        <div
                          className={`flex items-center m-3 gap-2`}
                          key={index}
                        >
                          <div className="flex-col text-center">
                            <p className="text-sm">
                              {moment(transaction.date).utc().format("DD/MM")}
                            </p>
                          </div>

                          <div className="flex-1">
                            <h2 className="text-md font-bold">
                              {transaction.spentOn ||
                                transaction?.category?.category}
                            </h2>
                          </div>

                          <div className="flex items-center text-center font-bold text-md">
                            <IndianRupee className="icon" />
                            {transaction.amount}
                          </div>

                          <div className="flex gap-1">
                            <CustomEditIcon
                              onClick={() => {
                                setTransactionToEdit(transaction._id);
                                setOpen({ type: "EDIT", open: true });
                              }}
                            />
                            <CustomDeleteIcon
                              onClick={() => {
                                setTransactionToDelete(transaction._id);
                                setOpen({ type: "DELETE", open: true });
                              }}
                            />
                          </div>
                        </div>

                        {index !== groupedTransactions[group].length - 1 && (
                          <Separator />
                        )}
                      </>
                    )
                  )}
                </CardContent>
              </Card>
            </div>
            <Separator />
          </>
        ))
      ) : (
        <Table className="overflow-auto">
          <TableHeader>
            <TableRow>
              <TableHead>For:</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-2">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.transactions.map((transaction: any) => (
              <TableRow key={transaction._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="w-6 h-6">
                            <AvatarFallback>
                              {transaction?.category?.icon}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent className="bg-background">
                          <Label className="text-primary">
                            {transaction?.category?.category}
                          </Label>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Label className="text-wrap">
                      {transaction.spentOn || transaction?.category?.category}
                    </Label>
                  </div>
                </TableCell>
                <TableCell className="flex items-center">
                  <IndianRupee className="icon" />
                  {transaction.amount}
                </TableCell>
                <TableCell className="text-sm">
                  {moment(transaction.date).utc().format("DD/MM")}
                </TableCell>
                <TableCell className="flex justify-around items-center">
                  <CustomEditIcon
                    onClick={() => {
                      setTransactionToEdit(transaction._id);
                      setOpen({ type: "EDIT", open: true });
                    }}
                  />
                  <CustomDeleteIcon
                    onClick={() => {
                      setTransactionToDelete(transaction._id);
                      setOpen({ type: "DELETE", open: true });
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <ResponsiveDialogAndDrawer
        open={open.type === "DELETE" && open.open}
        handleClose={handleClose}
        title={"Delete Transaction"}
        content={
          <>
            <div>
              <Label>Are you sure you want to delete this transaction?</Label>
            </div>
            <div className="flex justify-between items-center mt-5">
              <Button
                type="reset"
                variant="default"
                onClick={handleClose}
                disabled={deleteTransaction.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteTransaction}
                variant="destructive"
                loading={deleteTransaction.isPending}
              >
                Delete
              </Button>
            </div>
          </>
        }
      />
      <ResponsiveDialogAndDrawer
        open={(open.type === "ADD" || open.type === "EDIT") && open.open}
        handleClose={handleClose}
        title={
          open.type === "ADD"
            ? "Add Transaction"
            : open.type === "EDIT"
            ? "Edit Transaction"
            : ""
        }
        content={
          gettingTransactionById ? (
            <TransactionFormSkeleton />
          ) : (
            <TransactionForm
              initialValues={initialValues}
              onReset={handleClose}
              editTransaction={transactionToEdit}
            />
          )
        }
      />
    </>
  );
};

export default Transactions;
