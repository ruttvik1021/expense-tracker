import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "../ui/card";

export const CategorySkeleton = () => {
  return (
    <Card className="p-4">
      <CardHeader className="p-0 mb-3">
        <div className="flex justify-between ">
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex justify-between items-center p-0">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[100px]" />
      </CardContent>
    </Card>
  );
};

export const TransactionFormSkeleton = () => {
  return (
    <div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="my-1" key={i}>
          <Skeleton className="mb-2 w-32 h-4 rounded" />
          <Skeleton className="h-9 rounded" />
        </div>
      ))}
      <div className="flex justify-between items-center">
        <Skeleton className="w-32 h-9 rounded-md" />
        <Skeleton className="w-32 h-9 rounded-md" />
      </div>
    </div>
  );
};
