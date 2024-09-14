"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryDocument } from "@/models/CategoryModel";
import {
  Field,
  FieldInputProps,
  FieldMetaProps,
  Formik,
  FormikHelpers,
} from "formik";
import { CalendarIcon } from "lucide-react";
import moment from "moment";
import React from "react";
import * as Yup from "yup";
import { useCategories } from "../category/hooks/useCategoryQuery";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export interface TransactionFormValues {
  spentOn: string;
  category: string;
  date: string;
  amount: number;
}

interface CategoryFormProps {
  initialValues: TransactionFormValues;
  validationSchema: Yup.Schema<any>;
  onSubmit: (
    values: TransactionFormValues,
    formikHelpers: FormikHelpers<TransactionFormValues>
  ) => void;
  onReset: () => void;
  submitText?: string;
}

const TransactionForm = ({
  initialValues,
  validationSchema,
  onSubmit,
  onReset,
  submitText = "Add",
}: CategoryFormProps) => {
  const { data } = useCategories();
  const [date, setDate] = React.useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = React.useState<boolean>(false);
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      onReset={onReset}
    >
      {({ setFieldValue, handleSubmit, handleReset }) => (
        <form onSubmit={handleSubmit} onReset={handleReset}>
          <Field name="amount">
            {({
              field,
              meta,
            }: {
              field: FieldInputProps<number>;
              meta: FieldMetaProps<number>;
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
          <Field name="category">
            {({
              field,
              meta,
            }: {
              field: FieldInputProps<string>;
              meta: FieldMetaProps<string>;
            }) => (
              <div className="my-2">
                <Label htmlFor="category">Category:</Label>
                <Select onValueChange={(e) => setFieldValue("category", e)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Fruits</SelectLabel>
                      {data?.data?.categories.map(
                        (category: CategoryDocument) => (
                          <SelectItem value={category._id as string}>
                            <p className="flex items-between gap-2">
                              {category.icon}
                              {category.category}
                            </p>
                          </SelectItem>
                        )
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {meta.touched && meta.error && (
                  <div className="text-base text-red-600">{meta.error}</div>
                )}
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
                    setFieldValue(
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
          <Field name="spentOn">
            {({ field }: { field: FieldInputProps<string> }) => (
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

          <div className="flex justify-between">
            <Button type="reset" variant="outline" onClick={handleReset}>
              Clear
            </Button>
            <Button type="submit" variant="default">
              {submitText}
            </Button>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default TransactionForm;
