"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { queryKeys } from "@/utils/queryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Field,
  FieldInputProps,
  FieldMetaProps,
  Form,
  FormikProvider,
  useFormik,
} from "formik";
import { IndianRupee, Tag } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import {
  getPreviousMonthCategories,
  importFromLastMonth,
} from "../../../server/actions/category/category";
import EmojiPicker from "../emojiPicker";
import ResponsiveDialogAndDrawer from "../responsiveDialogAndDrawer";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useAuthContext } from "../wrapper/ContextWrapper";
import { useCategoryMutation } from "./hooks/useCategoryMutation";
import { Separator } from "../ui/separator";

export interface CategoryFormValues {
  icon: string;
  category: string;
  budget: number;
  periodType: PeriodType; // New field for period type
  startMonth: number; // New field for start month
  creationDuration: CategoryCreationDuration; // New field for creation duration
}

export enum PeriodType {
  ONCE = "once",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  HALF_YEARLY = "half-yearly",
  // ANNUALLY = "annually",
}

export enum CategoryCreationDuration {
  NEXT_12_MONTHS = "next12Months",
  YEAR_END = "yearEnd",
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
  periodType: PeriodType.ONCE, // Default value
  startMonth: moment().month() + 1, // Default to the current month
  creationDuration: CategoryCreationDuration.YEAR_END, // Default value
};

const validationSchema = Yup.object({
  icon: Yup.string().required("Icon is required"),
  category: Yup.string().required("Category is required"),
  budget: Yup.number()
    .min(1, "Budget must be greater than or equal to 1")
    .typeError("Must be a number")
    .required("Budget is required"),
  startMonth: Yup.number().when("periodType", {
    // Use a function to specify the condition
    is: (periodType: PeriodType) => periodType !== PeriodType.ONCE,
    then(schema) {
      return schema
        .required("Start month is required")
        .min(1, "Start month must be between 1 and 12")
        .max(12, "Start month must be between 1 and 12");
    },
    otherwise(schema) {
      return schema.notRequired().nullable();
    },
  }),
  creationDuration: Yup.string().when("periodType", {
    is: (periodType: PeriodType) => periodType !== PeriodType.ONCE,
    then(schema) {
      return schema.required("Creation duration is required");
    },
    otherwise(schema) {
      return schema.notRequired().nullable();
    },
  }),
});

const CategoryForm = ({
  initialValues,
  onReset,
  editCategory = "",
}: CategoryFormProps) => {
  const queryClient = useQueryClient();
  const { categoryFilter } = useAuthContext();
  const [open, setOpen] = useState<boolean>(false);
  const [getFromPreviousMonth, setGetFromPreviousMonth] =
    useState<boolean>(false);
  const { data: previousMonthCategories, isLoading } = useQuery({
    queryKey: [queryKeys.lastMonthCategories, categoryFilter.categoryDate],
    queryFn: () => getPreviousMonthCategories(),
    enabled: getFromPreviousMonth,
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategorySelection = (id: string) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  const { addCategory, updateCategory } = useCategoryMutation();

  const isCategoryMutating = addCategory.isPending || updateCategory.isPending;
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

  const importCategoriesFromLastMonth = async () => {
    const { message, error } = await importFromLastMonth({
      list: selectedCategories,
    });

    if (error) {
      toast.error(message);
    } else {
      toast.success(message);
    }
    queryClient.invalidateQueries({
      queryKey: [queryKeys.categories, categoryFilter],
    });
    setSelectedCategories([]);
    setGetFromPreviousMonth(false);
  };

  return (
    <>
      {editCategory ? (
        <></>
      ) : (
        <div className="flex justify-center">
          <Button
            variant="link"
            size="sm"
            className="border my-2"
            onClick={() => setGetFromPreviousMonth(!getFromPreviousMonth)}
          >
            {getFromPreviousMonth ? "Create New" : "Get from previous month"}
          </Button>
        </div>
      )}

      {getFromPreviousMonth ? (
        <>
          <p>Imported categories will be added to this month only</p>
          <div className="rounded-lg border p-1 max-h-40 overflow-auto mb-3">
            <ul>
              {isLoading && <li>Loading...</li>}
              {previousMonthCategories?.categories.map((category, index) => (
                <>
                  <li
                    className="flex items-center space-x-4 p-1 gap-1 my-1"
                    key={index}
                    onClick={() => handleCategorySelection(category._id)}
                  >
                    <Checkbox
                      checked={selectedCategories.includes(category._id)}
                      onCheckedChange={() =>
                        handleCategorySelection(category._id)
                      }
                    />
                    <Label>
                      {category.category}: {category.budget}
                    </Label>
                  </li>
                  <Separator />
                </>
              ))}
            </ul>
          </div>
          <div className="flex flex-row-reverse">
            <Button onClick={() => importCategoriesFromLastMonth()}>
              Import Categories
            </Button>
          </div>
        </>
      ) : (
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
                      className={`cursor-pointer rounded-full p-1 border-2 ${
                        meta.touched && meta.error
                          ? "border-red-600"
                          : "border-selected"
                      }`}
                      {...field}
                      onClick={() => !isCategoryMutating && setOpen(true)}
                    >
                      <AvatarFallback className="rounded-full">
                        {field.value}
                      </AvatarFallback>
                    </Avatar>
                    {meta.touched && meta.error && (
                      <Label className="text-left text-lg text-red-600 dark:text-red-600">
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
                      disabled={isCategoryMutating}
                    />
                    {meta.touched && meta.error && (
                      <Label className="text-lg text-red-600 dark:text-red-600">
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
                      disabled={isCategoryMutating}
                    />
                    {meta.touched && meta.error && (
                      <Label className="text-lg text-red-600 dark:text-red-600">
                        {meta.error}
                      </Label>
                    )}
                  </div>
                )}
              </Field>
              {editCategory ? (
                <></>
              ) : (
                <>
                  <Field name="periodType">
                    {({
                      field,
                      meta,
                    }: {
                      field: FieldInputProps<PeriodType>;
                      meta: FieldMetaProps<PeriodType>;
                    }) => (
                      <div className="space-y-1 my-2">
                        <Label
                          htmlFor="periodType"
                          className="flex items-center space-x-2 text-gray-700"
                        >
                          <span>Period Type</span>
                        </Label>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            categoryFormik.setFieldValue(field.name, value);
                            if (value === PeriodType.ONCE) {
                              categoryFormik.setFieldValue("startMonth", null);
                              categoryFormik.setFieldValue(
                                "creationDuration",
                                null
                              );
                            }
                          }}
                          disabled={isCategoryMutating}
                        >
                          <SelectTrigger className="w-full mb-3">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(PeriodType).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {meta.touched && meta.error && (
                          <Label className="text-lg text-red-600 dark:text-red-600">
                            {meta.error}
                          </Label>
                        )}
                      </div>
                    )}
                  </Field>

                  {!(categoryFormik.values.periodType === PeriodType.ONCE) && (
                    <>
                      <Field name="startMonth">
                        {({
                          field,
                          meta,
                        }: {
                          field: FieldInputProps<number>;
                          meta: FieldMetaProps<number>;
                        }) => (
                          <div className="space-y-1 my-2">
                            <Label
                              htmlFor="startMonth"
                              className="flex items-center space-x-2 text-gray-700"
                            >
                              <span>Start Month</span>
                            </Label>
                            <Select
                              value={String(field.value)}
                              onValueChange={(value) =>
                                categoryFormik.setFieldValue(field.name, value)
                              }
                              disabled={isCategoryMutating}
                            >
                              <SelectTrigger className="w-full mb-3">
                                <SelectValue placeholder="Year" />
                              </SelectTrigger>
                              <SelectContent>
                                {moment
                                  .months()
                                  .slice(moment().month())
                                  .map((month, index) => (
                                    <SelectItem
                                      key={index}
                                      value={String(
                                        moment().month() + index + 1
                                      )}
                                    >
                                      {month}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            {meta.touched && meta.error && (
                              <Label className="text-lg text-red-600 dark:text-red-600">
                                {meta.error}
                              </Label>
                            )}
                          </div>
                        )}
                      </Field>

                      <Field name="creationDuration">
                        {({
                          field,
                          meta,
                        }: {
                          field: FieldInputProps<CategoryCreationDuration>;
                          meta: FieldMetaProps<CategoryCreationDuration>;
                        }) => (
                          <div className="space-y-1 my-2">
                            <Label
                              htmlFor="creationDuration"
                              className="flex items-center space-x-2 text-gray-700"
                            >
                              <span>Create Till</span>
                            </Label>
                            <Select
                              value={field.value}
                              onValueChange={(value) =>
                                categoryFormik.setFieldValue(field.name, value)
                              }
                              disabled={isCategoryMutating}
                            >
                              <SelectTrigger className="w-full mb-3">
                                <SelectValue placeholder="Year" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(CategoryCreationDuration).map(
                                  (duration) => (
                                    <SelectItem key={duration} value={duration}>
                                      {duration.charAt(0).toUpperCase() +
                                        duration.slice(1)}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                            {meta.touched && meta.error && (
                              <Label className="text-lg text-red-600 dark:text-red-600">
                                {meta.error}
                              </Label>
                            )}
                          </div>
                        )}
                      </Field>
                    </>
                  )}
                </>
              )}
              <div className="flex justify-between mt-3">
                <Button
                  type="reset"
                  variant="destructive"
                  onClick={() => categoryFormik.resetForm()}
                  disabled={isCategoryMutating}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  loading={isCategoryMutating}
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
              <EmojiPicker
                onClick={(e) => {
                  categoryFormik.setFieldValue("icon", e.emoji);
                  setOpen(false);
                }}
              />
            }
          />
        </>
      )}
    </>
  );
};

export default CategoryForm;
