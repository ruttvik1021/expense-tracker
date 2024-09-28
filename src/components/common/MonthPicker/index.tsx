"use client";

import { useState, useCallback } from "react";
import {
  ArrowLeftIcon,
  ChevronLeft,
  ChevronRight,
  MoveLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import moment from "moment";
import { cn } from "@/lib/utils";

const MonthYearPicker = ({
  handlePrevMonth,
  handleNextMonth,
  handleMonthChange,
  date,
  navigationButton,
  btnClassName = "",
}: {
  handlePrevMonth?: (value: Date) => void;
  handleNextMonth?: (value: Date) => void;
  handleMonthChange: (value: Date) => void;
  date: Date;
  navigationButton?: boolean;
  btnClassName?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [year, setYear] = useState<string>(date.getFullYear().toString());
  const months = moment.months();

  const currentDate = new Date(); // Current date
  const currentMonth = currentDate.getMonth(); // Current month (0-11)
  const currentYear = currentDate.getFullYear(); // Current year

  const years = Array.from(
    { length: 2 },
    (_, i) => new Date().getFullYear() - 1 + i
  );

  const handlePrevMonthClick = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - 1);
    handlePrevMonth && handlePrevMonth(newDate);
  };

  const handleNextMonthClick = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1);
    handleNextMonth && handleNextMonth(newDate);
  };

  const handleMonthChangeClick = (value: string) => {
    const newDate = new Date(date);
    newDate.setMonth(months.indexOf(value));
    newDate.setFullYear(parseInt(year));
    handleMonthChange(newDate);
    setOpen(!open);
  };

  const handleYearChange = (value: string) => {
    setYear(value);
  };

  return (
    <>
      {navigationButton && (
        <Button variant="outline" size="icon" onClick={handlePrevMonthClick}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-[150px]", btnClassName)}
            disabled
          >
            {months[date.getMonth()]} {date.getFullYear()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <Select value={year} onValueChange={handleYearChange}>
            <SelectTrigger className="w-full mb-3">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => (
              <button
                key={month}
                className={`p-2 text-center ${
                  date.getMonth() === index &&
                  date.getFullYear() === parseInt(year)
                    ? "bg-selected text-white"
                    : parseInt(year) === currentYear && index > currentMonth
                    ? "bg-gray-300"
                    : "bg-primary-foreground "
                }`}
                onClick={() => handleMonthChangeClick(month)}
                disabled={
                  parseInt(year) === currentYear && index > currentMonth
                }
              >
                {month}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {navigationButton &&
        moment(date).endOf("month").isBefore(moment().endOf("month")) && (
          <Button variant="outline" size="icon" onClick={handleNextMonthClick}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
    </>
  );
};

export default MonthYearPicker;
