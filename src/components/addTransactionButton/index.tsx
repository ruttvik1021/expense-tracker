"use client";
import { Button, ButtonProps } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDeviceType } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, PlusCircleIcon } from "lucide-react";
import moment from "moment-timezone";
import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Field, Formik, FormikProvider, useFormik } from "formik";
import * as Yup from "yup";

const AddButton = (props: ButtonProps) => {
  return (
    <Button className="flex gap-2" variant="outline" {...props}>
      <p>Add</p> <PlusCircleIcon />
    </Button>
  );
};

const TransactionForm = () => {
  const [date, setDate] = React.useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = React.useState<boolean>(false);
  const validationSchema = Yup.object().shape({
    amount: Yup.number()
      .required("Amount is required")
      .positive("Amount must be positive"),
  });

  // Initial Values
  const initialValues = {
    amount: 0,
    spentOn: "",
    date: moment().format("DD/MM/YYYY"),
  };

  const handleSubmit = async (values: typeof initialValues) => {
    console.log(values);
  };

  const transactionFormik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <form onSubmit={transactionFormik.handleSubmit}>
      <FormikProvider value={transactionFormik}>
        <Field name="amount">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {({ field, meta }: any) => (
            <div className="my-2">
              <Label htmlFor={"amount"}>Amount</Label>
              <Input
                {...field}
                type={"number"}
                autoComplete="false"
                placeholder="Amount"
              />
              {meta.touched && meta.error && (
                <div className="text-sm text-red-600">{meta.error}</div>
              )}
            </div>
          )}
        </Field>
        <Field name="spentOn">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {({ field }: any) => (
            <div className="my-2">
              <Label htmlFor={"spentOn"}>For:</Label>
              <Input
                {...field}
                type="text"
                id="amount-spent-on"
                placeholder="What did you spend on ?"
              />
            </div>
          )}
        </Field>

        <div className="my-2">
          <Label htmlFor="date">Date:</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal text-black border-black ${
                  !date ? "text-muted-foreground" : ""
                }`}
                onClick={() => setCalendarOpen(!calendarOpen)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  <p>{moment(date).format("DD/MM/YYYY")}</p>
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => {
                  setDate(date || new Date());
                  transactionFormik.setFieldValue(
                    "date",
                    moment(date).format("DD/MM/YYYY")
                  );
                  setCalendarOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Save</Button>
        </div>
      </FormikProvider>
    </form>
  );
};

const AddTransaction = () => {
  const [open, setOpen] = React.useState(false);
  const { isDesktop } = useDeviceType();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <AddButton onClick={() => setOpen(true)} />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              <TransactionForm />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <AddButton onClick={() => setOpen(true)} />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add Transaction</DrawerTitle>
          <DrawerDescription>
            <TransactionForm />
          </DrawerDescription>
        </DrawerHeader>
        <AddButton />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AddTransaction;
