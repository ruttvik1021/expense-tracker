"use client";

import { Field, Form, Formik } from "formik";
import { Circle, FilterIcon } from "lucide-react";
import moment from "moment";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useCategories } from "../category/hooks/useCategoryQuery";
import MonthYearPicker from "../common/MonthPicker";
import {
  initialTransactionFilter,
  useAuthContext,
} from "../wrapper/ContextWrapper";

export default function TransactionFilters() {
  const { transactionFilter, setTransactionFilter } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const { data: categories } = useCategories();

  const initialFormik = { ...initialTransactionFilter, ...transactionFilter };
  const isFilterApplied = Object.keys(transactionFilter).length > 0;

  const onSubmit = (values: typeof initialTransactionFilter) => {
    const filterValues = {
      ...values,
      month: moment(values.month).format(),
    };
    setTransactionFilter(filterValues);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <FilterIcon
          className={cn(
            "",
            isFilterApplied ? "text-selected fill-selected" : ""
          )}
        />
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="text-left">
          <div className="flex justify-between">
            <SheetTitle>Transaction Filters</SheetTitle>
            <Circle
              onClick={() => setIsOpen(false)}
              className="fill-destructive rounded-full icon border"
            />
          </div>
          <SheetDescription>
            Apply filters to your transactions
          </SheetDescription>
        </SheetHeader>
        <Formik initialValues={initialFormik} onSubmit={onSubmit}>
          {({ values, setFieldValue }) => (
            <Form className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="dateRange" className="text-sm font-medium">
                  Choose Month (Default Current Month)
                </Label>
                <MonthYearPicker
                  navigationButton={false}
                  handleMonthChange={(value) => setFieldValue("month", value)}
                  date={new Date(values.month)}
                  btnClassName="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category
                </Label>
                <Select
                  onValueChange={(value) => setFieldValue("categoryId", value)}
                  value={values.categoryId}
                >
                  <SelectTrigger id="categoryId" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.categories.map((category: any) => (
                      <SelectItem key={category._id} value={category._id}>
                        <div className="flex items-center gap-2">
                          <Label>{category.icon}</Label>
                          <Label>{category.category}</Label>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Amount Range</Label>
                <div className="flex items-center space-x-2">
                  <div className="w-full">
                    <Label htmlFor="minAmount" className="sr-only">
                      Minimum Amount
                    </Label>
                    <Field name="minAmount">
                      {({ field }: { field: any }) => (
                        <Input
                          id="minAmount"
                          type="number"
                          placeholder="Min"
                          {...field}
                          onChange={(e) =>
                            setFieldValue("minAmount", Number(e.target.value))
                          }
                          className="w-full"
                        />
                      )}
                    </Field>
                  </div>
                  <span className="text-sm text-muted-foreground">to</span>
                  <div className="w-full">
                    <Label htmlFor="maxAmount" className="sr-only">
                      Maximum Amount
                    </Label>
                    <Field name="maxAmount">
                      {({ field }: { field: any }) => (
                        <Input
                          id="maxAmount"
                          type="number"
                          placeholder="Max"
                          {...field}
                          onChange={(e) =>
                            setFieldValue("maxAmount", Number(e.target.value))
                          }
                          className="w-full"
                        />
                      )}
                    </Field>
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full" variant="default">
                Apply Filters
              </Button>
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  setTransactionFilter({});
                  setIsOpen(false);
                }}
                variant="secondary"
              >
                Reset
              </Button>
            </Form>
          )}
        </Formik>
      </SheetContent>
    </Sheet>
  );
}
