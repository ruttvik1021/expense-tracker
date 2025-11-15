import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn, generateHslColor } from "@/lib/utils";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

type ChartDataItem = Record<string, unknown>;

interface BaseBarGraphProps {
  title: string;
  description: string;
  yAxisKey: string;
  xAxisKey: string;
  chartData: ChartDataItem[];
  isLoading: boolean;
  filterContent?: React.ReactNode;
  tooltipKey?: string;
  iconNameKey?: string;
}

const useColorCycle = (data: ChartDataItem[]) => {
  return data.map((item, index) => ({
    ...item,
    fill: generateHslColor(index, data.length),
  }));
};

export default function BaseBarGraph({
  title,
  yAxisKey,
  xAxisKey,
  chartData,
  isLoading,
  filterContent,
  tooltipKey,
  iconNameKey,
}: BaseBarGraphProps) {
  const chartConfig = {} satisfies ChartConfig;
  const coloredData = useColorCycle(chartData);

  return (
    <div className="space-y-4">
      <Card className={cn("w-full")}>
        <div className="flex items-center justify-between p-6">
          <CardTitle className="text-xs sm:text-md font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {filterContent && <div>{filterContent}</div>}
        </div>
        <Separator className="bg-selected" />
        <CardContent className="pt-6">
          <ChartContainer config={chartConfig}>
            {isLoading ? (
              <Label>Getting data...</Label>
            ) : coloredData.length ? (
              <BarChart
                data={coloredData}
                layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                aria-label={`Bar chart showing ${title}`}
              >
                <YAxis
                  dataKey={yAxisKey}
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tickFormatter={(value) => value}
                  hide
                />
                <XAxis dataKey={xAxisKey} type="number" hide />
                <ChartTooltip
                  cursor={false}
                  formatter={(value, _, item) => {
                    return (
                      <div
                        className="bg-inherit text-foreground"
                        style={{
                          width: "100%",
                        }}
                      >
                        {tooltipKey && (
                          <p className="mb-1">{item.payload[tooltipKey]}</p>
                        )}
                        <div
                          className="flex justify-between items-center"
                          style={{
                            borderTop: "4px solid",
                            borderColor: item.payload.fill,
                          }}
                        >
                          <div className="flex">
                            <span className="font-semibold text-foreground">
                              {iconNameKey
                                ? item.payload[iconNameKey]
                                : item.payload[yAxisKey]}
                              :
                            </span>
                          </div>
                          <span className="text-foreground">
                            {value.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      className="text-md font-bold w-[150px]"
                    />
                  }
                />
                <Bar
                  dataKey={xAxisKey}
                  layout="vertical"
                  fill="var(--color-desktop)"
                  radius={4}
                >
                  <LabelList
                    dataKey={yAxisKey}
                    position="insideLeft"
                    offset={8}
                    className="fill-foreground text-lg sm:text-lg font-medium"
                  />
                </Bar>
              </BarChart>
            ) : (
              <Label>No Data Found</Label>
            )}
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
