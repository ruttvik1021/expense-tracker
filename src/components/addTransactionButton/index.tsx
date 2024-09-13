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
  DrawerContent,
  DrawerDescription,
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
import {
  Field,
  FieldInputProps,
  FieldMetaProps,
  FormikProvider,
  useFormik,
} from "formik";
import { Calendar as CalendarIcon, PlusCircleIcon } from "lucide-react";
import moment from "moment-timezone";
import React from "react";
import * as Yup from "yup";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const AddButton: React.FC<ButtonProps> = (props) => (
  <Button className="flex gap-2" variant="outline" {...props}>
    <p>Add Transaction</p> <PlusCircleIcon />
  </Button>
);

const TransactionForm: React.FC = () => {
  const [date, setDate] = React.useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = React.useState<boolean>(false);

  const validationSchema = Yup.object({
    amount: Yup.number()
      .required("Amount is required")
      .positive("Amount must be positive"),
  });

  const initialValues = {
    amount: 0,
    spentOn: "",
    date: moment().format("DD/MM/YYYY"),
  };

  const handleSubmit = async (values: typeof initialValues) => {
    console.log(values);
    alert(JSON.stringify(values, null, 2));
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <FormikProvider value={formik}>
        <Field name="amount">
          {({
            field,
            meta,
          }: {
            field: FieldInputProps<typeof formik.values.amount>;
            meta: FieldMetaProps<typeof formik.values.amount>;
          }) => (
            <div className="my-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                {...field}
                type="number"
                autoComplete="off"
                placeholder="Amount"
              />
              {meta.touched && meta.error && (
                <div className="text-base text-red-600">{meta.error}</div>
              )}
            </div>
          )}
        </Field>
        <Field name="spentOn">
          {({
            field,
          }: {
            field: FieldInputProps<typeof formik.values.spentOn>;
          }) => (
            <div className="my-2">
              <Label htmlFor="spentOn">For:</Label>
              <Input
                {...field}
                type="text"
                id="spentOn"
                placeholder="What did you spend on?"
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
                className={`w-full justify-start text-left font-normal bg-transparent dark:border-white border-black`}
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
                onSelect={(selectedDate) => {
                  setDate(selectedDate || new Date());
                  formik.setFieldValue(
                    "date",
                    moment(selectedDate).format("DD/MM/YYYY")
                  );
                  setCalendarOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex justify-between">
          <Button
            type="reset"
            variant="outline"
            onClick={() => formik.resetForm()}
          >
            Clear
          </Button>
          <Button type="submit" variant="default">
            Add
          </Button>
        </div>
      </FormikProvider>
    </form>
  );
};

const AddTransaction: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const { isDesktop } = useDeviceType();

  return isDesktop ? (
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
  ) : (
    <Drawer open={open} onOpenChange={setOpen} onDrag={() => setOpen(false)}>
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
      </DrawerContent>
    </Drawer>
  );
};

export default AddTransaction;
