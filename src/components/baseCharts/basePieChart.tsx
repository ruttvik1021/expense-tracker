import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import React from "react";
import { Label as ChartLabel, Pie, PieChart } from "recharts";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

type ChartDataItem = Record<string, unknown>;

interface BasePieGraphProps {
  title: string;
  description: string;
  valueKey: string;
  labelKey: string;
  chartData: ChartDataItem[];
  isLoading: boolean;
  filterContent?: React.ReactNode;
}

const useColorCycle = (data: ChartDataItem[]) => {
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
    "hsl(var(--chart-7))",
    "hsl(var(--chart-8))",
    "hsl(var(--chart-9))",
    "hsl(var(--chart-10))",
  ];
  return data.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length],
  }));
};

const LoadingSkeleton = () => (
  <div className="flex flex-col justify-between space-y-4 py-4">
    {[...Array(5)].map((_, idx) => (
      <div
        key={idx}
        className="h-5 sm:h-20 bg-primary/10 animate-pulse rounded mt-2 sm:mt-10"
        style={{ width: `${90 - idx * 10}%` }} // Decreasing width for each bar
      ></div>
    ))}
  </div>
);

export default function BasePieGraph({
  title,
  description,
  valueKey,
  labelKey,
  chartData,
  isLoading,
  filterContent,
}: BasePieGraphProps) {
  const chartConfig = {} satisfies ChartConfig;
  const coloredData = useColorCycle(chartData);

  type ColoredDataItem = {
    fill: string;
    [key: string]: number | string;
  };

  const total = React.useMemo(() => {
    return coloredData?.reduce(
      (acc, curr: ColoredDataItem) => acc + (curr[valueKey] as number),
      0
    );
  }, [coloredData, valueKey]);

  return (
    <div className="space-y-4">
      <Card className={cn("w-full")}>
        <div className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {filterContent && <div>{filterContent}</div>}
        </div>
        <Separator className="bg-selected" />
        <CardContent className="pt-6">
          <ChartContainer config={chartConfig}>
            {isLoading ? (
              <LoadingSkeleton />
            ) : coloredData.length ? (
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={coloredData}
                  dataKey={valueKey}
                  nameKey={labelKey}
                  innerRadius={60}
                  strokeWidth={15}
                >
                  <ChartLabel
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {total?.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Total
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            ) : (
              <Label>No Data Found</Label>
            )}
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
