"use client";
import { Badge } from "@/components/ui/badge";
import useSpentVsBudgetData, {
  formatNumber,
} from "@/hooks/useSpentVsBudgetData";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/utils/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getLastMonthAmount } from "../../../server/actions/profile/profile";
import { FeatureRestrictedWarning } from "../alerts/EmailVerification";
import MonthYearPicker from "../common/MonthPicker";
import { Navlink } from "../common/Navigation";
import PageHeader from "../common/Pageheader";
import CustomAddIcon from "../icons/customAddIcon";
import CustomDeleteIcon from "../icons/customDeleteIcon";
import CustomEditIcon from "../icons/customEditIcon";
import ResponsiveDialogAndDrawer from "../responsiveDialogAndDrawer";
import TransactionForm, {
  transactionFormInitialValues,
} from "../transactions/transactionForm";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
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
import CategoryForm, {
  categoryFormInitialValues,
  PeriodType,
} from "./categoryForm";
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

  const { totalBudget, totalSpent, isOverBudget, percentageSpent } =
    useSpentVsBudgetData("Categories");

  const { data: lastMonthAmount } = useQuery({
    queryKey: [queryKeys.monthAmount],
    queryFn: () => getLastMonthAmount(categoryFilter.categoryDate),
  });

  const difference = totalSpent - lastMonthAmount?.amount;
  const isDecrease = difference < 0;

  return (
    <>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <PageHeader title="Category" />
          {moment(categoryFilter.categoryDate).isBefore(
            moment().add(1, "month").startOf("month")
          ) &&
            (isEmailVerified || (data && data?.categories?.length < 5)) && (
              <CustomAddIcon
                onClick={() => {
                  setOpen({ type: "ADD", open: true });
                }}
                type="ICON"
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
        className={`grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`}
      >
        <Card
          className={cn(
            "w-full max-w-md",
            isOverBudget ? "shadow-red-500" : "shadow-green-500"
          )}
        >
          <CardHeader className="pb-2">
            <div
              className={`flex items-center text-sm font-bold ${
                isOverBudget ? "text-red-500" : "text-green-500"
              }`}
            >
              {totalBudget === 0 || !totalBudget ? (
                <div>
                  <Label className="mr-1">Update your monthly budget</Label>
                  <Navlink
                    link={{ href: "profile", label: "here", isActive: true }}
                  />
                </div>
              ) : isOverBudget ? (
                <div className="flex justify-between w-full">
                  <p>You're over budget by:</p>
                  <p>{formatNumber(totalSpent - (totalBudget || 0))}</p>
                </div>
              ) : (
                <div className="flex justify-between w-full">
                  <p>You're under budget by:</p>
                  <p>{formatNumber((totalBudget || 0) - totalSpent)}</p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Spent {totalBudget ? "/Budget" : ""}
              </span>
              <span
                className={cn(
                  "text-2xl font-bold",
                  isOverBudget ? "text-red-500" : "text-green-500"
                )}
              >
                {formatNumber(totalSpent)}
                {totalBudget ? `/${formatNumber(totalBudget)}` : null}
              </span>
            </div>
            <Progress
              value={percentageSpent}
              className="h-2 w-full"
              fillColor={isOverBudget ? "red-500" : "green-500"}
            />
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Last Month:{" "}
                  {lastMonthAmount?.amount.toLocaleString("en-IN") || 0}
                </p>
              </div>
              <div
                className={`flex items-center text-sm ${
                  isDecrease ? "text-green-500" : "text-red-500"
                }`}
              >
                {isDecrease ? (
                  <ArrowDownIcon className="mr-1 h-4 w-4" />
                ) : (
                  <ArrowUpIcon className="mr-1 h-4 w-4" />
                )}
                <span className="text-sm font-bold">
                  {Math.abs(difference).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))
          : data?.categories?.map((category: any) => {
              return (
                <Card key={category._id} className="p-4 shadow-selected">
                  <CardHeader className="p-0 mb-3">
                    <div className="flex justify-between">
                      <p className="text-4xl">{category.icon}</p>
                      <div className="flex gap-2">
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

                      <div className="flex">
                        {category.periodType &&
                          category.periodType !== PeriodType.ONCE && (
                            <>
                              <Label className="text-sm mt-1">
                                {category.periodType.toUpperCase()}
                              </Label>
                            </>
                          )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base">
                        Budget:{" "}
                        <Badge className="font-bold hover:bg-none">
                          {category.budget.toLocaleString("en-IN")}
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
                          {category.totalAmountSpent.toLocaleString("en-IN")}
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
