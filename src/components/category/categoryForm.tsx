"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { queryKeys } from "@/utils/queryKeys";
import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import {
  Field,
  FieldInputProps,
  FieldMetaProps,
  Form,
  FormikProvider,
  useFormik,
} from "formik";
import { IndianRupee, Tag } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";
import EmojiPicker from "../emojiPicker";
import ResponsiveDialogAndDrawer from "../responsiveDialogAndDrawer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useCategoryMutation } from "./hooks/useCategoryMutation";

export interface CategoryFormValues {
  icon: string;
  category: string;
  budget: number;
}

interface CategoryFormProps {
  onReset: () => void;
  editCategory?: string;
  initialValues?: CategoryFormValues;
}

export const categoryFormInitialValues: CategoryFormValues = {
  icon: "",
  category: "",
  budget: 0,
};

const validationSchema = Yup.object({
  icon: Yup.string().required("Icon is required"),
  category: Yup.string().required("Category is required"),
  budget: Yup.number()
    .min(1, "Budget must be greater than or equal to 1")
    .typeError("Must be a number")
    .required("Budget is required"),
});

const CategoryForm = ({
  initialValues,
  onReset,
  editCategory = "",
}: CategoryFormProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);
  const isCategoryMutating = useIsMutating({
    mutationKey: [queryKeys.mutateCategory],
  });
  const { addCategory, updateCategory } = useCategoryMutation();
  const handleSubmit = async (values: CategoryFormValues) => {
    if (editCategory) {
      await updateCategory.mutateAsync({ id: editCategory, values });
      queryClient.removeQueries({
        queryKey: [queryKeys.categories, editCategory],
      });
    } else {
      await addCategory.mutateAsync(values);
    }
    onReset();
  };

  const categoryFormik = useFormik({
    initialValues: { ...categoryFormInitialValues, ...initialValues },
    validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <>
      <FormikProvider value={categoryFormik}>
        <Form onSubmit={categoryFormik.handleSubmit} className="text-left">
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
                {meta.touched && meta.error && (
                  <Label className="text-left text-base text-red-600 dark:text-red-600">
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
                  <Label className="text-base text-red-600 dark:text-red-600">
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
                  <Label className="text-base text-red-600 dark:text-red-600">
                    {meta.error}
                  </Label>
                )}
              </div>
            )}
          </Field>

          <div className="flex justify-between mt-3">
            <Button
              type="reset"
              variant="destructive"
              onClick={() => categoryFormik.resetForm()}
              disabled={isCategoryMutating > 0}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isCategoryMutating > 0}
            >
              {editCategory ? "Update" : "Add"}
            </Button>
          </div>
        </Form>
      </FormikProvider>
      <ResponsiveDialogAndDrawer
        open={open}
        handleClose={() => setOpen(false)}
        title={"Pick Emoji for Category"}
        content={
          <div className="flex justify-center">
            <EmojiPicker
              onClick={(e) => {
                categoryFormik.setFieldValue("icon", e.emoji);
                setOpen(false);
              }}
            />
          </div>
        }
      />
    </>
  );
};

export default CategoryForm;
