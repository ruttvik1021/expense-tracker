"use client";

import { Field, Form, Formik } from "formik";
import { CalendarIcon, FilterIcon } from "lucide-react";
import moment from "moment";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

const categories = [
  "Food & Drink",
  "Shopping",
  "Housing",
  "Transportation",
  "Entertainment",
  "Healthcare",
  "Personal",
  "Education",
  "Travel",
];

export default function TransactionFilters() {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: string;
    to: string;
  }>({
    from: moment().format(),
    to: moment().add(7, "days").format(),
  });

  const initialValues = {
    dateRange: dateRange,
    category: "",
    minAmount: 0,
    maxAmount: 1000,
  };

  const onSubmit = (values: typeof initialValues) => {
    console.log(values);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <FilterIcon className="icon" />
          <span className="sr-only">Filter transactions</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Transaction Filters</SheetTitle>
          <SheetDescription>
            Apply filters to your transactions
          </SheetDescription>
        </SheetHeader>
        <Formik initialValues={initialValues} onSubmit={onSubmit}>
          {({ values, setFieldValue }) => (
            <Form className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="dateRange" className="text-sm font-medium">
                  Date Range
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="dateRange"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !values.dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {values.dateRange.from ? (
                        values.dateRange.to ? (
                          <>
                            {moment(values.dateRange.from).format(
                              "MMM DD, YYYY"
                            )}{" "}
                            -{" "}
                            {moment(values.dateRange.to).format("MMM DD, YYYY")}
                          </>
                        ) : (
                          moment(values.dateRange.from).format("MMM DD, YYYY")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={moment(values.dateRange.from).toDate()}
                      fromDate={moment(values.dateRange.from).toDate()}
                      toDate={moment(values.dateRange.to).toDate()}
                      onSelect={(newDateRange) => {
                        newDateRange ? setDateRange(newDateRange as any) : null;
                        setFieldValue("dateRange", newDateRange);
                      }}
                      numberOfMonths={1}
                      className="sm:numberOfMonths-2"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category
                </Label>
                <Select
                  onValueChange={(value) => setFieldValue("category", value)}
                  value={values.category}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
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
              <Button type="submit" className="w-full">
                Apply Filters
              </Button>
              <Button
                type="button"
                className="w-full"
                onClick={() => setIsOpen(false)}
                variant="destructive"
              >
                Cancel
              </Button>
            </Form>
          )}
        </Formik>
      </SheetContent>
    </Sheet>
  );
}
