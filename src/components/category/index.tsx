"use client";
import { getCategoryApi } from "@/ajax/categoryApi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const Category = () => {
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategoryApi(),
  });

  if (!data) return <div>Loading...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
      {data.data.categories.map((category: any) => (
        <Card key={category.id} className="p-4">
          <CardHeader className="p-0 mb-3">
            <Avatar className="cursor-pointer p-1 border-2 border-selected">
              <AvatarImage src={category.icon} />
              <AvatarFallback>{category.category}</AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent className="flex-col items-center p-0">
            <h3 className="font-semibold text-base">{category.category}</h3>
            <p className="text-base">Budget: {category.budget}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Category;
