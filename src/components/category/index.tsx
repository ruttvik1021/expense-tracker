"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Car, Film, ShoppingCart } from "lucide-react";
import AddCategory from "../addCategoryButton";

const Category = () => {
  const categories = [
    {
      id: 1,
      category: "Groceries",
      budget: 500,
      spending: 350,
      icon: ShoppingCart,
    },
    {
      id: 2,
      category: "Entertainment",
      budget: 200,
      spending: 150,
      icon: Film,
    },
    {
      id: 3,
      category: "Transportation",
      budget: 300,
      spending: 280,
      icon: Car,
    },
  ];
  return (
    <div className="flex overflow-auto md:flex-wrap gap-5">
      <AddCategory type="Card" />
      {categories.map((category) => (
        <Card key={category.id} className="p-4 min-w-32 cursor-pointer">
          <CardHeader className="p-0">
            <category.icon className="h-8 w-8 mb-2" />
          </CardHeader>
          <CardContent className="flex-col items-center p-0">
            <h3 className="font-semibold text-sm">{category.category}</h3>
            <p className="text-sm">Budget: ${category.budget}</p>
          </CardContent>
          <CardFooter>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div className="bg-blue-600 h-1.5 rounded-full"></div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default Category;
