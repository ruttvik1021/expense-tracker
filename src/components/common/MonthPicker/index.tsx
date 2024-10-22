"use client";

import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { queryKeys } from "@/utils/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { getProfile } from "../../../../server/actions/profile/profile";

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
  const { data: userData } = useQuery({
    queryKey: [queryKeys.profile],
    queryFn: () => getProfile(),
  });

  const [open, setOpen] = useState<boolean>(false);
  const [year, setYear] = useState<string>(new Date(date).getFullYear()?.toString());
  const months = moment.months();

  const userCreated = new Date(userData?.data?.createdAt);
  const currentDate = new Date(); // Current date
  const currentMonth = currentDate.getMonth(); // Current month (0-11)
  const currentYear = currentDate.getFullYear(); // Current year
  const createdAtYear = userCreated.getFullYear();

  const years = Array.from(
    { length: currentYear - createdAtYear + 1 },
    (_, i) => createdAtYear + i
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
    <div>
      {navigationButton && (
        <ChevronLeft className="icon" onClick={handlePrevMonthClick} />
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full border border-foreground rounded-full",
              btnClassName
            )}
          >
            {months[date.getMonth()]} {date.getFullYear()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          {years.length > 1 ? (
            <>
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
            </>
          ) : null}

          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => (
              <button
                key={month}
                className={`p-2 text-center rounded-full ${
                  date.getMonth() === index &&
                  date.getFullYear() === parseInt(year)
                    ? "bg-selected text-white"
                    : parseInt(year) === currentYear && index > currentMonth
                    ? "bg-destructive/40"
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
          <ChevronRight className="icon" onClick={handleNextMonthClick} />
        )}
    </div>
  );
};

export default MonthYearPicker;
