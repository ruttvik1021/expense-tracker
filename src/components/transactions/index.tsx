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
import {
  IndianRupee,
  MoreHorizontal,
  MoreVertical,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
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

enum GroupBy {
  NONE = "none",
  DATE = "date",
  CATEGORY = "category",
  SOURCE = "source",
}

const groupTransactionsBy = [
  { label: "Recent", value: GroupBy.NONE },
  { label: "Category", value: GroupBy.CATEGORY },
  { label: "Source", value: GroupBy.SOURCE },
];

const Transactions = () => {
  const [groupBy, setGroupBy] = useState(GroupBy.NONE);
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
    source: transactionData?.data.source || "",
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
        groupBy === GroupBy.DATE
          ? transaction.date
          : groupBy === GroupBy.SOURCE
          ? transaction.source?.source || "Other"
          : transaction.category.category;
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
          <Select
            onValueChange={(value) => setGroupBy(value as GroupBy)}
            value={groupBy}
          >
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
        className={
          "flex items-center text-foreground text-sm font-semibold mb-3"
        }
      >
        Overall spending for this month is:{" "}
        <p className="flex items-center mx-2">
          {" "}
          <IndianRupee className="icon" />{" "}
          <span className="font-bold text-lg">
            {totalSpent.toLocaleString("en-IN")}
          </span>
        </p>
      </div>
      <Separator />
      {groupBy !== GroupBy.NONE ? (
        groupedTransactions &&
        Object.keys(groupedTransactions).map((group) => (
          <>
            <div key={group} className="mb-6">
              <h2 className="text-md my-2 font-bold text-selected">
                {groupBy === GroupBy.DATE ? (
                  moment(group).utc().format("DD/MM/YYYY")
                ) : (
                  <div className="flex items-center gap-2">
                    <Label className="text-3xl">
                      {groupBy === GroupBy.CATEGORY
                        ? groupedTransactions[group][0].category?.icon
                        : ""}
                    </Label>
                    <Label className="text-selected text-lg font-semibold">
                      {group}:{" "}
                      {groupedTransactions[group]
                        ?.reduce(
                          (acc: number, transaction: any) =>
                            acc + transaction.amount,
                          0
                        )
                        .toLocaleString("en-IN") || 0}
                    </Label>
                  </div>
                )}
              </h2>
              <Card className="w-full shadow-none border-none">
                <CardContent className="p-0 pt-3 pb-3">
                  {groupedTransactions[group].map(
                    (transaction: any, index: number) => (
                      <>
                        <div
                          key={transaction._id}
                          className="w-full p-1 shadow-none"
                        >
                          <div className="flex flex-wrap gap-1 font-semibold mb-1">
                            <p className="text-wrap">
                              {transaction.spentOn ||
                                transaction.category.category}
                            </p>
                          </div>
                          <div className="grid grid-cols-7 gap-2 items-center">
                            {/* Amount */}
                            <div className="col-span-2">
                              <p className="flex items-center gap-1 text-sm font-medium">
                                <IndianRupee className="w-3 h-3" />
                                {transaction.amount.toLocaleString("en-IN")}
                              </p>
                            </div>

                            {/* Source */}
                            <div className="col-span-2">
                              <p className="text-sm">
                                {transaction.source?.source || "Other"}
                              </p>
                            </div>

                            {/* Date */}
                            <div className="col-span-2">
                              <p className="text-sm">
                                {moment(transaction.date).utc().format("DD/MM")}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1 rounded-full hover:bg-accent">
                                    <MoreHorizontal className="w-4 h-4" />
                                    <span className="sr-only">
                                      More options
                                    </span>
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-32"
                                >
                                  <DropdownMenuItem>
                                    <CustomEditIcon
                                      type="LINK"
                                      onClick={() => {
                                        setTransactionToEdit(transaction._id);
                                        setOpen({ type: "EDIT", open: true });
                                      }}
                                    />
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <CustomDeleteIcon
                                      type="LINK"
                                      onClick={() => {
                                        setTransactionToDelete(transaction._id);
                                        setOpen({ type: "DELETE", open: true });
                                      }}
                                    />
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>

                        {index !== groupedTransactions[group].length - 1 && (
                          <Separator className="my-2" />
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
        <>
          {/* Table View for larger screens */}
          <div className="hidden md:block">
            <Table className="overflow-auto">
              <TableHeader>
                <TableRow>
                  <TableHead>For:</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-1">Actions</TableHead>
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
                          {transaction.spentOn ||
                            transaction?.category?.category}
                        </Label>
                      </div>
                    </TableCell>
                    <TableCell className="flex items-center">
                      <IndianRupee className="icon" />
                      {transaction.amount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      {transaction.source?.source || "Other"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {moment(transaction.date).utc().format("DD/MM")}
                    </TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <TableCell className="flex justify-around items-center">
                          <MoreVertical />
                          <span className="sr-only">More</span>
                        </TableCell>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="mr-3 rounded-lg">
                        <DropdownMenuItem>
                          <CustomEditIcon
                            onClick={() => {
                              setTransactionToEdit(transaction._id);
                              setOpen({ type: "EDIT", open: true });
                            }}
                            type="LINK"
                          />
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CustomDeleteIcon
                            onClick={() => {
                              setTransactionToDelete(transaction._id);
                              setOpen({ type: "DELETE", open: true });
                            }}
                            type="LINK"
                          />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Card View for mobile devices */}
          <div className="block md:hidden">
            {data?.transactions.map((transaction: any) => (
              <Card
                key={transaction._id}
                className="w-full mb-3 p-1 shadow-none"
              >
                <div className="flex flex-wrap gap-1 font-semibold mb-1">
                  <p className="text-wrap space-x-2">
                    <span>{transaction.category.icon}</span>
                    <span>{transaction.category.category}:</span>
                  </p>
                  <p className="text-wrap">
                    {transaction.spentOn || transaction.category.category}
                  </p>
                </div>
                <div className="grid grid-cols-7 gap-2 items-center">
                  {/* Amount */}
                  <div className="col-span-2">
                    <p className="flex items-center gap-1 text-sm font-medium">
                      <IndianRupee className="w-3 h-3" />
                      {transaction.amount.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Source */}
                  <div className="col-span-2">
                    <p className="text-sm">
                      {transaction.source?.source || "Other"}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="col-span-2">
                    <p className="text-sm">
                      {moment(transaction.date).utc().format("DD/MM")}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-full hover:bg-accent">
                          <MoreHorizontal className="w-4 h-4" />
                          <span className="sr-only">More options</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem>
                          <CustomEditIcon
                            type="LINK"
                            onClick={() => {
                              setTransactionToEdit(transaction._id);
                              setOpen({ type: "EDIT", open: true });
                            }}
                          />
                          <span className="ml-2">Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CustomDeleteIcon
                            type="LINK"
                            onClick={() => {
                              setTransactionToDelete(transaction._id);
                              setOpen({ type: "DELETE", open: true });
                            }}
                          />
                          <span className="ml-2">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
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
