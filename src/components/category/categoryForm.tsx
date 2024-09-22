"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { queryKeys } from "@/utils/queryKeys";
import { useIsMutating } from "@tanstack/react-query";
import {
  Field,
  FieldInputProps,
  FieldMetaProps,
  Formik,
  FormikHelpers,
} from "formik";
import { IndianRupee, Tag } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";
import EmojiPicker from "../emojiPicker";
import ResponsiveDialogAndDrawer from "../responsiveDialogAndDrawer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export interface CategoryFormValues {
  icon: string;
  category: string;
  budget: number;
}

interface CategoryFormProps {
  initialValues: CategoryFormValues;
  validationSchema: Yup.Schema<any>;
  onSubmit: (
    values: CategoryFormValues,
    formikHelpers: FormikHelpers<CategoryFormValues>
  ) => void;
  onReset: () => void;
  submitText?: string;
}

const CategoryForm = ({
  initialValues,
  validationSchema,
  onSubmit,
  onReset,
  submitText = "Add",
}: CategoryFormProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const isCategoryMutating = useIsMutating({
    mutationKey: [queryKeys.mutateCategory],
  });
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      onReset={onReset}
    >
      {({ setFieldValue, handleSubmit, handleReset }) => (
        <form onSubmit={handleSubmit} onReset={handleReset}>
          <Field name="icon">
            {({
              field,
              meta,
            }: {
              field: FieldInputProps<string>;
              meta: FieldMetaProps<string>;
            }) => (
              <div className="my-2">
                <Avatar
                  className={`cursor-pointer p-1 border-2 ${
                    meta.touched && meta.error
                      ? "border-red-600"
                      : "border-selected"
                  }`}
                  {...field}
                  onClick={() => setOpen(true)}
                >
                  <AvatarFallback>{field.value}</AvatarFallback>
                </Avatar>
                <ResponsiveDialogAndDrawer
                  open={open}
                  handleClose={() => setOpen(false)}
                  title={"Pick Emoji for Category"}
                  content={
                    <div className="flex justify-center">
                      <EmojiPicker
                        onClick={(e) => {
                          setFieldValue("icon", e.emoji);
                          setOpen(false);
                        }}
                      />
                    </div>
                  }
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
              <div className="space-y-1 my-2">
                <Label
                  htmlFor="category"
                  className="flex items-center space-x-2 text-gray-700"
                >
                  <Tag className="w-5 h-5" />
                  <span>Category</span>
                </Label>
                <Input
                  {...field}
                  type="text"
                  id="category"
                  placeholder="Category Name"
                  disabled={isCategoryMutating > 0}
                />
                {meta.touched && meta.error && (
                  <Label className="text-base text-red-600 dark:text-red-600 pl-2">
                    {meta.error}
                  </Label>
                )}
              </div>
            )}
          </Field>

          <Field name="budget">
            {({
              field,
              meta,
            }: {
              field: FieldInputProps<number>;
              meta: FieldMetaProps<number>;
            }) => (
              <div className="space-y-1">
                <Label
                  htmlFor="category"
                  className="flex items-center space-x-2 text-gray-700"
                >
                  <IndianRupee className="w-5 h-5" />
                  <span>Budget</span>
                </Label>
                <Input
                  {...field}
                  type="number"
                  autoComplete="off"
                  placeholder="Budget (Monthly)"
                  disabled={isCategoryMutating > 0}
                />
                {meta.touched && meta.error && (
                  <Label className="text-base text-red-600 dark:text-red-600 pl-2">
                    {meta.error}
                  </Label>
                )}
              </div>
            )}
          </Field>

          <div className="flex justify-between mt-3">
            <Button
              type="reset"
              variant="outline"
              onClick={handleReset}
              disabled={isCategoryMutating > 0}
            >
              Clear
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isCategoryMutating > 0}
            >
              {submitText}
            </Button>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default CategoryForm;
