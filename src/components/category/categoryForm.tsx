"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Field,
  FieldInputProps,
  FieldMetaProps,
  Formik,
  FormikHelpers,
} from "formik";
import { useState } from "react";
import * as Yup from "yup";
import EmojiPicker from "../emojiPicker";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

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
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Avatar
                      className={`cursor-pointer p-1 border-2 ${
                        meta.touched && meta.error
                          ? "border-red-600"
                          : "border-selected"
                      }`}
                      {...field}
                    >
                      <AvatarFallback>{field.value}</AvatarFallback>
                    </Avatar>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <EmojiPicker
                      onClick={(emojiObject: { native: unknown }) => {
                        setFieldValue("icon", emojiObject.native);
                        setOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
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
                <Input
                  {...field}
                  type="text"
                  id="category"
                  placeholder="Category Name"
                />
                {meta.touched && meta.error && (
                  <div className="text-base text-red-600">{meta.error}</div>
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
              <div className="my-2">
                <Label htmlFor="budget">Budget (Monthly):</Label>
                <Input
                  {...field}
                  type="number"
                  autoComplete="off"
                  placeholder="Budget (Monthly)"
                />
                {meta.touched && meta.error && (
                  <div className="text-base text-red-600">{meta.error}</div>
                )}
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

export default CategoryForm;
