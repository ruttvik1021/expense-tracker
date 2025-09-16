"use client";
import { Badge } from "@/components/ui/badge";
import useSpentVsBudgetData from "@/hooks/useSpentVsBudgetData";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FeatureRestrictedWarning } from "../alerts/EmailVerification";
import MonthYearPicker from "../common/MonthPicker";
import PageHeader from "../common/Pageheader";
import CustomAddIcon from "../icons/customAddIcon";
import CustomDeleteIcon from "../icons/customDeleteIcon";
import CustomEditIcon from "../icons/customEditIcon";
import ResponsiveDialogAndDrawer from "../responsiveDialogAndDrawer";
import TransactionForm, {
  transactionFormInitialValues,
} from "../transactions/transactionForm";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useAuthContext } from "../wrapper/ContextWrapper";
import CategoryForm, { categoryFormInitialValues } from "./categoryForm";
import { useCategoryMutation } from "./hooks/useCategoryMutation";
import { useCategories, useCategoryById } from "./hooks/useCategoryQuery";
import { CategoryFormSkeleton, CategorySkeleton } from "./skeleton";

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
    isEmailVerified,
  } = useAuthContext();
  const router = useRouter();
  const { data, isLoading } = useCategories();
  const { deleteCategory } = useCategoryMutation();
  const [open, setOpen] = useState<{
    type: "ADD" | "EDIT" | "DELETE";
    open: boolean;
  }>({
    type: "ADD",
    open: false,
  });

  const [categoryToEdit, setCategoryToEdit] = useState<string>("");
  const [categoryToDelete, setCategoryToDelete] = useState<string>("");
  const [transactionToAddCategory, setTransactionToAddCategory] = useState<{
    id: "";
    date: Date;
  } | null>(null);
  const updateCategoryDate = (value: Date) => {
    setCategoryFilter({ ...categoryFilter, categoryDate: value });
  };

  const updateCategorySort = (sortBy: CategorySortBy) => {
    setCategoryFilter({ ...categoryFilter, sortBy });
  };

  const { data: categoryData, isLoading: gettingCategoryById } =
    useCategoryById(categoryToEdit);

  const initialValues = {
    ...categoryFormInitialValues,
    icon: categoryData?.data.icon || "",
    category: categoryData?.data.category || "",
    budget: categoryData?.data.budget || 0,
  };

  const handleDeleteCategory = async () => {
    await deleteCategory.mutateAsync(categoryToDelete!);
    handleClose();
  };

  const handleClose = () => {
    setCategoryToEdit("");
    setCategoryToDelete("");
    setOpen({ type: "ADD", open: false });
  };

  const { totalBudget, totalSpent } = useSpentVsBudgetData("Categories");

  return (
    <>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <PageHeader title="Category" />
          {moment(categoryFilter.categoryDate).isSame(moment(), "month") &&
            (isEmailVerified || (data && data?.categories?.length < 5)) && (
              <CustomAddIcon
                onClick={() => {
                  setOpen({ type: "ADD", open: true });
                }}
              />
            )}
        </div>
        {!isEmailVerified && data && data?.categories?.length > 4 && (
          <FeatureRestrictedWarning message="Verify email to add more categories" />
        )}
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Select
            onValueChange={updateCategorySort}
            value={categoryFilter.sortBy}
          >
            <SelectTrigger
              id="categoryId"
              className="sm:w-full sm:max-w-[180px]"
            >
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
          <MonthYearPicker
            handlePrevMonth={(value) => updateCategoryDate(value)}
            handleNextMonth={(value) => updateCategoryDate(value)}
            handleMonthChange={(value) => updateCategoryDate(value)}
            date={categoryFilter.categoryDate}
            navigationButton={false}
          />
        </div>
      </div>
      <div
        className={`grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3`}
      >
        <Card className="shadow-soft hover:shadow-medium transition-shadow animate-fade-in hover-scale">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg truncate">
                    Total Spending
                  </CardTitle>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Budget Info */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Spent</span>
                <span className="font-medium">
                  {totalSpent} / {totalBudget}
                </span>
              </div>

              <Progress
                value={(Number(totalSpent) / Number(totalBudget)) * 100}
              />
            </div>
          </CardContent>
        </Card>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))
          : data?.categories?.map((category: any) => {
              return (
                <Card
                  key={category.id}
                  className="shadow-soft hover:shadow-medium transition-shadow animate-fade-in hover-scale"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span
                          className="text-xl sm:text-2xl flex-shrink-0 border rounded-full p-2"
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
                          {category.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg truncate">
                            {category.category}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {category.periodType.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        {moment(categoryFilter.categoryDate).isBefore(
                          moment().add(1, "month").startOf("month")
                        ) && (
                          <>
                            <CustomAddIcon
                              onClick={() =>
                                setTransactionToAddCategory({
                                  id: category._id,
                                  date: categoryFilter.categoryDate,
                                })
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
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Budget Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Spent</span>
                        <span
                          className="font-medium"
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
                          {category.totalAmountSpent} / {category.budget}
                        </span>
                      </div>

                      <Progress
                        value={
                          (Number(category.totalAmountSpent) /
                            Number(category.budget)) *
                          100
                        }
                      />
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
                variant="default"
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
              onReset={handleClose}
              editCategory={categoryToEdit}
            />
          )
        }
      />

      <ResponsiveDialogAndDrawer
        open={transactionToAddCategory ? true : false}
        handleClose={() => setTransactionToAddCategory(null)}
        title={
          open.type === "ADD"
            ? "Add Transaction"
            : open.type === "EDIT"
            ? "Edit Transaction"
            : ""
        }
        content={
          <TransactionForm
            initialValues={{
              ...transactionFormInitialValues,
              category: transactionToAddCategory?.id || "",
              date: moment(transactionToAddCategory?.date).format() || "",
            }}
            onReset={() => setTransactionToAddCategory(null)}
          />
        }
      />
    </>
  );
};

export default Category;
