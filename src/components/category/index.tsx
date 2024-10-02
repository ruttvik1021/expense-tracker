"use client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/utils/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import * as Yup from "yup";
import MonthYearPicker from "../common/MonthPicker";
import PageHeader from "../common/Pageheader";
import CustomAddIcon from "../icons/customAddIcon";
import CustomDeleteIcon from "../icons/customDeleteIcon";
import CustomEditIcon from "../icons/customEditIcon";
import ResponsiveDialogAndDrawer from "../responsiveDialogAndDrawer";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useAuthContext } from "../wrapper/ContextWrapper";
import CategoryForm, { CategoryFormValues } from "./categoryForm";
import { useCategoryMutation } from "./hooks/useCategoryMutation";
import { useCategories, useCategoryById } from "./hooks/useCategoryQuery";
import { CategoryFormSkeleton, CategorySkeleton } from "./skeleton";
import { ArrowDownIcon, ArrowUpIcon, IndianRupee } from "lucide-react";
import { Progress } from "../ui/progress";
import useSpentVsBudgetData from "@/hooks/useSpentVsBudgetData";

export enum CategorySortBy {
  CATEGORY = "category",
  BUDGET = "budget",
  RECENT_TRANSACTIONS = "recentTransactions",
  AMOUNT_SPENT = "amountSpent",
}

const Category = () => {
  const sortFilters = [
    {
      label: "Category Name",
      value: CategorySortBy.CATEGORY,
    },
    {
      label: "Recent transaction",
      value: CategorySortBy.RECENT_TRANSACTIONS,
    },
    {
      label: "Budget",
      value: CategorySortBy.BUDGET,
    },
    {
      label: "Amount Spent",
      value: CategorySortBy.AMOUNT_SPENT,
    },
  ];

  const {
    categoryFilter,
    setCategoryFilter,
    transactionFilter,
    setTransactionFilter,
  } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data, isLoading } = useCategories();
  const { addCategory, deleteCategory, updateCategory } = useCategoryMutation();
  const [open, setOpen] = useState<{
    type: "ADD" | "EDIT" | "DELETE";
    open: boolean;
  }>({
    type: "ADD",
    open: false,
  });

  const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const updateCategoryDate = (value: Date) => {
    setCategoryFilter({ ...categoryFilter, categoryDate: value });
  };

  const updateCategorySort = (sortBy: CategorySortBy) => {
    setCategoryFilter({ ...categoryFilter, sortBy });
  };

  const { data: categoryData, isLoading: gettingCategoryById } =
    useCategoryById(categoryToEdit || "");

  const initialValues: CategoryFormValues = {
    icon: categoryData?.data.icon || "",
    category: categoryData?.data.category || "",
    budget: categoryData?.data.budget || 0,
  };

  const validationSchema = Yup.object({
    icon: Yup.string().required("Icon is required"),
    category: Yup.string().required("Category is required"),
    budget: Yup.number()
      .typeError("Must be a number")
      .required("Budget is required"),
  });

  const handleSubmit = async (values: CategoryFormValues) => {
    if (categoryToEdit) {
      await updateCategory.mutateAsync({ id: categoryToEdit, values });
      queryClient.removeQueries({
        queryKey: [queryKeys.categories, categoryToEdit],
      });
    } else {
      await addCategory.mutateAsync(values);
    }
    handleClose();
  };

  const handleDeleteCategory = async () => {
    await deleteCategory.mutateAsync(categoryToDelete!);
    handleClose();
  };

  const handleClose = () => {
    setCategoryToEdit(null);
    setCategoryToDelete(null);
    setOpen({ type: "ADD", open: false });
  };

  const { totalBudget, totalSpent, isOverBudget, percentageSpent } =
    useSpentVsBudgetData("Categories");

  return (
    <>
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <PageHeader title="Category" />
        <div className="flex justify-between items-center gap-2">
          <div className="space-y-2">
            <Select
              onValueChange={updateCategorySort}
              value={categoryFilter.sortBy}
            >
              <SelectTrigger id="categoryId" className="min-w-[150px]  ">
                <SelectValue placeholder="Sort category by" />
              </SelectTrigger>
              <SelectContent>
                {sortFilters.map((sort: { label: string; value: string }) => (
                  <SelectItem key={sort.value} value={sort.value}>
                    {sort.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <MonthYearPicker
            handlePrevMonth={(value) => updateCategoryDate(value)}
            handleNextMonth={(value) => updateCategoryDate(value)}
            handleMonthChange={(value) => updateCategoryDate(value)}
            date={categoryFilter.categoryDate}
            navigationButton={false}
          />
          <CustomAddIcon
            onClick={() => {
              setOpen({ type: "ADD", open: true });
            }}
          />
        </div>
      </div>
      <div className={`grid gap-4 md:grid-cols-3 lg:grid-cols-5`}>
        <Card
          className={cn(
            "w-full max-w-md shadow-md",
            isOverBudget ? "shadow-red-500" : "shadow-green-500"
          )}
        >
          <CardHeader className="pb-2">
            <div
              className={`flex items-center text-md font-bold ${
                isOverBudget ? "text-red-500" : "text-green-500"
              }`}
            >
              {isOverBudget ? (
                <>
                  You're over budget by: <IndianRupee className="icon" />
                  {totalSpent - totalBudget}
                </>
              ) : (
                <>
                  You're under budget by: <IndianRupee className="icon" />
                  {totalBudget - totalSpent}
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Spent/Budget</span>
              <span
                className={cn(
                  "text-2xl font-bold",
                  isOverBudget ? "text-red-500" : "text-green-500"
                )}
              >
                {totalSpent}/{totalBudget}
              </span>
            </div>
            <Progress
              value={percentageSpent}
              className="h-2 w-full"
              fillColor={isOverBudget ? "red-500" : "green-500"}
            />
          </CardContent>
        </Card>
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))
          : data?.data?.categories.map((category: any) => {
              return (
                <Card
                  key={category._id}
                  className="p-4 shadow-md shadow-selected"
                >
                  <CardHeader className="p-0 mb-3">
                    <div className="flex justify-between">
                      <p className="text-4xl">{category.icon}</p>
                      <div className="flex gap-2">
                        <CustomAddIcon
                          onClick={() =>
                            router.push(
                              `transactions?addBycategory=${category._id}&navigate=${pathname}`
                            )
                          }
                        />
                        <CustomEditIcon
                          onClick={() => {
                            setCategoryToEdit(category._id);
                            setOpen({ type: "EDIT", open: true });
                          }}
                        />
                        <CustomDeleteIcon
                          onClick={() => {
                            setCategoryToDelete(category._id);
                            setOpen({ type: "DELETE", open: true });
                          }}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex justify-between p-0">
                    <div>
                      <p
                        className={`font-bold text-base cursor-pointer hover:text-selected`}
                        onClick={() => {
                          setTransactionFilter({
                            ...(transactionFilter || {}),
                            categoryId: category._id,
                            month: new Date(
                              categoryFilter.categoryDate
                            ).toISOString(),
                          });
                          router.push(`transactions`);
                        }}
                      >
                        {category.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base">
                        Budget:{" "}
                        <Badge className="font-bold hover:bg-none">
                          {category.budget}
                        </Badge>
                      </p>
                      <p className="text-base">
                        Spent:{" "}
                        <Badge
                          className={cn("font-bold cursor-pointer", {
                            "bg-red-500":
                              category.totalAmountSpent > category.budget,
                            "bg-green-500":
                              category.totalAmountSpent <= category.budget,
                          })}
                          onClick={() => {
                            setTransactionFilter({
                              ...(transactionFilter || {}),
                              categoryId: category._id,
                              month: new Date(
                                categoryFilter.categoryDate
                              ).toISOString(),
                            });
                            router.push(`transactions`);
                          }}
                        >
                          {category.totalAmountSpent}
                        </Badge>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <ResponsiveDialogAndDrawer
        open={open.type === "DELETE" && open.open}
        handleClose={handleClose}
        title={"Delete Category"}
        content={
          <>
            <div>
              <Label className="text-wrap">
                Are you sure you want to delete this category? <br /> All the
                transaction under this category will be deleted?
              </Label>
            </div>
            <div className="flex justify-between items-center mt-5">
              <Button
                type="reset"
                variant="outline"
                onClick={handleClose}
                disabled={deleteCategory.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteCategory}
                variant="destructive"
                loading={deleteCategory.isPending}
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
        title={open.type === "ADD" ? "Add Category" : "Edit Category"}
        content={
          gettingCategoryById ? (
            <CategoryFormSkeleton />
          ) : (
            <CategoryForm
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              onReset={handleClose}
              submitText={open.type === "ADD" ? "Add" : "Update"}
            />
          )
        }
      />
    </>
  );
};

export default Category;
