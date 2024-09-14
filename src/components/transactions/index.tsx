"use client";
import { Card, CardContent } from "@/components/ui/card";
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
import { useQueryClient } from "@tanstack/react-query";
import { Car, EditIcon, Trash2 } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import PageHeader from "../common/Pageheader";
import ResponsiveDialogAndDrawer from "../responsiveDialogAndDrawer";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useTransactionMutation } from "./hooks/useTransactionMutation";
import {
  useTransactionById,
  useTransactions,
} from "./hooks/useTransactionQuery";
import TransactionForm, { TransactionFormValues } from "./transactionForm";

const Transactions = () => {
  const queryClient = useQueryClient();
  const { data } = useTransactions();
  const { addTransaction, deleteTransaction, updateTransaction } =
    useTransactionMutation();
  const [open, setOpen] = useState<{
    type: "ADD" | "EDIT" | "DELETE";
    open: boolean;
  }>({
    type: "ADD",
    open: false,
  });
  const [transactionToEdit, setTransactionToEdit] = useState<string | null>(
    null
  );
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );

  const { data: transactionData } = useTransactionById(transactionToEdit || "");

  const validationSchema = Yup.object({
    amount: Yup.number()
      .required("Amount is required")
      .positive("Amount must be positive"),
    category: Yup.string().required("Category is required"),
  });

  const initialValues = {
    amount: 0,
    category: "",
    spentOn: "",
    date: moment().format("DD/MM/YYYY"),
  };

  const handleSubmit = async (values: TransactionFormValues) => {
    if (transactionToEdit) {
      await updateTransaction.mutateAsync({ id: transactionToEdit, values });
      queryClient.removeQueries({
        queryKey: ["transaction", transactionToEdit],
      });
    } else {
      await addTransaction.mutateAsync(values);
    }
    handleClose();
  };

  const handleDeleteTransaction = async () => {
    await deleteTransaction.mutateAsync(transactionToDelete!);
    handleClose();
  };

  const handleClose = () => {
    setTransactionToEdit(null);
    setTransactionToDelete(null);
    setOpen({ type: "ADD", open: false });
  };

  useEffect(() => {
    if (transactionData) {
      setOpen({ type: "EDIT", open: true });
    }
  }, [transactionData]);
  return (
    <>
      <div className="flex justify-between mb-3">
        <PageHeader title="Transactions" />
        <Button
          onClick={() => {
            setOpen({ type: "ADD", open: true });
          }}
        >
          Add
        </Button>
      </div>
      <Card>
        <CardContent>
          <Table className="overflow-auto">
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.transactions.map((transaction: any) => (
                <TableRow key={transaction._id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="w-6 h-6">
                              <AvatarFallback>
                                {transaction.category.icon}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent className="bg-background">
                            <Label className="text-primary">
                              {transaction.category.category}
                            </Label>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Label className="text-wrap">{transaction.spentOn}</Label>
                    </div>
                  </TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    <div className="flex justify-between items-center">
                      <EditIcon
                        onClick={() => setTransactionToEdit(transaction._id)}
                      />
                      <Trash2
                        onClick={() => {
                          setTransactionToDelete(transaction._id);
                          setOpen({ type: "DELETE", open: true });
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
              <Button type="reset" variant="outline" onClick={handleClose}>
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
          <TransactionForm
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            onReset={handleClose}
            submitText={open.type === "ADD" ? "Add" : "Update"}
          />
        }
      />
    </>
  );
};

export default Transactions;
