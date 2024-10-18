"use client";
import { queryKeys } from "@/utils/queryKeys";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { getTop5CategoriesOfMonth } from "../../../server/actions/category/category";
import BaseBarGraph from "../baseCharts/baseBarChart";
import MonthYearPicker from "../common/MonthPicker";

const Top5CategoriesOfMonth = () => {
  const [month, setMonth] = React.useState(new Date());
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.top5CategoriesOfMonth, month],
    queryFn: () => getTop5CategoriesOfMonth(month),
  });

  return (
    <>
      {/* <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Top 5 Categories</CardTitle>
          <CardDescription>
            Distribution of expenses by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {data?.map((category) => (
              <div className="flex items-center" key={category.category}>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {category.category}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-full bg-secondary rounded-full h-2 mr-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${
                            (category.amount / category.budget) * 100 > 100
                              ? 100
                              : (category.amount / category.budget) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    {category.amount}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
      <BaseBarGraph
        title={"Top 5 Categories"}
        description={""}
        yAxisKey={"category"}
        xAxisKey={"amount"}
        chartData={data || []}
        isLoading={isLoading}
        filterContent={
          <>
            <MonthYearPicker
              handleMonthChange={(value) => setMonth(value)}
              date={month}
            />
          </>
        }
      />
    </>
  );
};

export default Top5CategoriesOfMonth;
