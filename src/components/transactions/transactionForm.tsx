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
import { queryKeys } from "@/utils/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import {
  Field,
  FieldInputProps,
  FieldMetaProps,
  Form,
  FormikProvider,
  useFormik,
} from "formik";
import { CalendarIcon, IndianRupee, Notebook, Tag } from "lucide-react";
import moment from "moment";
import { usePathname } from "next/navigation";
import * as Yup from "yup";
import { useCategories } from "../category/hooks/useCategoryQuery";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useTransactionMutation } from "./hooks/useTransactionMutation";
import { useSources } from "../paymentSources/hooks/useSourcesQuery";
import ResponsiveDialogAndDrawer from "../responsiveDialogAndDrawer";
import CategoryForm from "../category/categoryForm";
import { useState } from "react";
import CustomAddIcon from "../icons/customAddIcon";

export interface TransactionFormValues {
  spentOn: string;
  category: string;
  date: string;
  amount: number;
  source: string;
}

interface CategoryFormProps {
  onReset: () => void;
  editTransaction?: string;
  initialValues?: TransactionFormValues;
}

const validateDate = (value: string) => {
  // Check if the value is a valid date in DD/MM/YYYY format
  return moment(value).isValid();
};

export const transactionFormValidationSchema = Yup.object({
  amount: Yup.number()
    .required("Amount is required")
    .positive("Amount must be positive"),
  category: Yup.string().required("Category is required"),
  spentOn: Yup.string().required("Spent on is required"),
  date: Yup.string()
    .required("Date is required")
    .test("is-valid-date", "Invalid Format", validateDate)
    .transform((value) => {
      return moment(value).format(); // Optional
    }),
});

export const transactionFormInitialValues = {
  amount: 0,
  category: "",
  spentOn: "",
  date: moment().format(),
  source: "",
};

const TransactionForm = ({
  initialValues,
  onReset,
  editTransaction = "",
}: CategoryFormProps) => {
  const pathname = usePathname();
  const disableDatePicker = pathname === "/transactions" ? false : true;
  const { data } = useCategories();
  const { data: paymentSources } = useSources();
  const [addCategory, setAddCategory] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const { addTransaction, updateTransaction } = useTransactionMutation();
  const isTransactionMutating =
    addTransaction.isPending || updateTransaction.isPending;

  const handleSubmit = async (values: TransactionFormValues) => {
    const payload = {
      ...values,
      date: moment(values.date).format(),
    };
    if (editTransaction) {
      await updateTransaction.mutateAsync({
        id: editTransaction,
        values: payload,
      });
      queryClient.removeQueries({
        queryKey: [queryKeys.transactions, editTransaction],
      });
    } else {
      await addTransaction.mutateAsync(payload);
    }
    onReset();
  };
  const transactionFormik = useFormik({
    initialValues: { ...transactionFormInitialValues, ...initialValues },
    validationSchema: transactionFormValidationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <>
      <FormikProvider value={transactionFormik}>
        <Form onSubmit={transactionFormik.handleSubmit}>
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
                  disabled={isTransactionMutating}
                />
                {meta.touched && meta.error && (
                  <Label className="text-base text-red-600 dark:text-red-600 pl-2">
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
                <div className="flex gap-2 items-center">
                  <Label
                    htmlFor="category"
                    className="flex items-center space-x-2 text-gray-700"
                  >
                    <Tag className="w-5 h-5" />
                    <span>Category</span>
                  </Label>
                  <CustomAddIcon onClick={() => setAddCategory(true)} />
                </div>
                <Select
                  onValueChange={(e) =>
                    transactionFormik.setFieldValue("category", e)
                  }
                  value={field.value}
                  disabled={isTransactionMutating}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {data?.categories.map((category: CategoryDocument) => (
                        <SelectItem
                          value={category._id as string}
                          key={category._id as string}
                          disabled={isTransactionMutating}
                        >
                          <div className="flex items-center gap-2">
                            <Label>{category.icon}</Label>
                            <Label>{category.category}</Label>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {meta.touched && meta.error && (
                  <Label className="text-base text-red-600 dark:text-red-600 pl-2">
                    {meta.error}
                  </Label>
                )}
              </div>
            )}
          </Field>
          <Field name="source">
            {({ field }: { field: FieldInputProps<string> }) => (
              <div className="spcace-y-1 my-2">
                <Label
                  htmlFor="source"
                  className="flex items-center space-x-2 text-gray-700"
                >
                  <Tag className="w-5 h-5" />
                  <span>Payment Source</span>
                </Label>
                <Select
                  onValueChange={(e) =>
                    transactionFormik.setFieldValue("source", e)
                  }
                  value={field.value}
                  disabled={isTransactionMutating}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {paymentSources?.map((source: any) => (
                        <SelectItem
                          value={source._id as string}
                          key={source._id as string}
                          disabled={isTransactionMutating}
                        >
                          <div className="flex items-center gap-2">
                            <Label>{source.source}</Label>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
                      ? moment(field.value).utc().format("YYYY-MM-DD")
                      : ""
                  }
                  onChange={(e) => {
                    transactionFormik.setFieldValue(
                      "date",
                      new Date(e.target.value)
                    );
                  }}
                  disabled={disableDatePicker || isTransactionMutating}
                  max={moment().format("YYYY-MM-DD")}
                />
                {meta.touched && meta.error && (
                  <Label className="text-base text-red-600 dark:text-red-600 pl-2">
                    {meta.error}
                  </Label>
                )}
              </div>
            )}
          </Field>

          <Field name="spentOn">
            {({
              field,
              meta,
            }: {
              field: FieldInputProps<string>;
              meta: FieldMetaProps<string>;
            }) => (
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
                  disabled={isTransactionMutating}
                />
                {meta.touched && meta.error && (
                  <Label className="text-base text-red-600 dark:text-red-600 pl-2">
                    {meta.error}
                  </Label>
                )}
              </div>
            )}
          </Field>

          <div className="flex justify-between">
            <Button
              type="reset"
              variant="destructive"
              onClick={() => transactionFormik.resetForm()}
              disabled={isTransactionMutating}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isTransactionMutating}
            >
              {editTransaction ? "Update" : "Add"}
            </Button>
          </div>
        </Form>
      </FormikProvider>
      <ResponsiveDialogAndDrawer
        open={addCategory}
        handleClose={() => setAddCategory(false)}
        title={"ADD"}
        content={<CategoryForm onReset={() => setAddCategory(false)} />}
      />
    </>
  );
};

export default TransactionForm;
