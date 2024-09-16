"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
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
import { CalendarIcon, IndianRupee, Notebook, Tag } from "lucide-react";
import moment from "moment";
import React from "react";
import * as Yup from "yup";
import { useCategories } from "../category/hooks/useCategoryQuery";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

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
              <div className="space-y-1 my-2">
                <Label
                  htmlFor="amount"
                  className="flex items-center space-x-2 text-gray-700"
                >
                  <IndianRupee className="w-5 h-5" />
                  <span>Amount</span>
                </Label>
                <Input
                  {...field}
                  type="number"
                  autoComplete="off"
                  placeholder="Amount"
                />
                {meta.touched && meta.error && (
                  <Label className="text-base text-red-600 pl-2">
                    {meta.error}
                  </Label>
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
              <div className="spcace-y-1 my-2">
                <Label
                  htmlFor="category"
                  className="flex items-center space-x-2 text-gray-700"
                >
                  <Tag className="w-5 h-5" />
                  <span>Category</span>
                </Label>
                <Select
                  onValueChange={(e) => setFieldValue("category", e)}
                  value={field.value}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {data?.data?.categories.map(
                        (category: CategoryDocument) => (
                          <SelectItem
                            value={category._id as string}
                            key={category._id as string}
                          >
                            <div className="flex items-center gap-2">
                              <Label>{category.icon}</Label>
                              <Label>{category.category}</Label>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {meta.touched && meta.error && (
                  <Label className="text-base text-red-600 pl-2">
                    {meta.error}
                  </Label>
                )}
              </div>
            )}
          </Field>
          <Field name="date">
            {({
              field,
              meta,
            }: {
              field: FieldInputProps<string>;
              meta: FieldMetaProps<string>;
            }) => (
              <div className="space-y-1 my-2">
                <Label
                  htmlFor="date"
                  className="flex items-center space-x-2 text-gray-700"
                >
                  <CalendarIcon className="w-5 h-5" />
                  <span>Date</span>
                </Label>
                <Input
                  type="date"
                  className={`w-full justify-start text-left font-normal bg-transparent dark:border-white border-black mt-1`}
                  value={
                    field.value
                      ? moment(field.value, "DD/MM/YYYY").format("YYYY-MM-DD")
                      : ""
                  }
                  onChange={(e) =>
                    setFieldValue(
                      "date",
                      moment(e.target.value, "YYYY-MM-DD").format("DD/MM/YYYY")
                    )
                  }
                />
                {meta.touched && meta.error && (
                  <Label className="text-base text-red-600 pl-2">
                    {meta.error}
                  </Label>
                )}
              </div>
            )}
          </Field>

          <Field name="spentOn">
            {({ field }: { field: FieldInputProps<string> }) => (
              <div className="space-y-1 my-2">
                <Label
                  htmlFor="spentOn"
                  className="flex items-center space-x-2 text-gray-700"
                >
                  <Notebook className="w-5 h-5" />
                  <span>For</span>
                </Label>
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
