"use client";
import { useQueryClient } from "@tanstack/react-query";
import { EditIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";
import PageHeader from "../common/Pageheader";
import ResponsiveDialogAndDrawer from "../responsiveDialogAndDrawer";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Label } from "../ui/label";
import CategoryForm, { CategoryFormValues } from "./categoryForm";
import { useCategoryMutation } from "./hooks/useCategoryMutation";
import { useCategories, useCategoryById } from "./hooks/useCategoryQuery";
import { CategoryFormSkeleton, CategorySkeleton } from "./skeleton";

const Category = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useCategories();
  const { addCategory, deleteCategory, updateCategory } = useCategoryMutation();

  const [open, setOpen] = useState<{
    type: "ADD" | "EDIT" | "DELETE";
    open: boolean;
  }>({
    type: "ADD",
    open: false,
  });
  const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const { data: categoryData, isLoading: gettingCategoryById } =
    useCategoryById(categoryToEdit || "");

  const initialValues: CategoryFormValues = {
    icon: categoryData?.data.icon || "",
    category: categoryData?.data.category || "",
    budget: categoryData?.data.budget || 0,
  };

  const validationSchema = Yup.object({
    icon: Yup.string().required("Icon is required"),
    category: Yup.string().required("Category is required"),
    budget: Yup.number().required("Budget is required"),
  });

  const handleSubmit = async (values: CategoryFormValues) => {
    if (categoryToEdit) {
      await updateCategory.mutateAsync({ id: categoryToEdit, values });
      queryClient.removeQueries({ queryKey: ["category", categoryToEdit] });
    } else {
      await addCategory.mutateAsync(values);
    }
    handleClose();
  };

  const handleDeleteCategory = async () => {
    await deleteCategory.mutateAsync(categoryToDelete!);
    handleClose();
  };

  const handleClose = () => {
    setCategoryToEdit(null);
    setCategoryToDelete(null);
    setOpen({ type: "ADD", open: false });
  };

  return (
    <>
      <div className="flex justify-between mb-3">
        <PageHeader title="Category" />
        <Button
          onClick={() => {
            setOpen({ type: "ADD", open: true });
          }}
        >
          Add
        </Button>
      </div>
      <div className={`grid gap-4 md:grid-cols-3 lg:grid-cols-5`}>
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))
          : data?.data?.categories.map((category: any) => {
              return (
                <Card
                  key={category._id}
                  className="p-4 shadow-md shadow-selected"
                >
                  <CardHeader className="p-0 mb-3">
                    <div className="flex justify-between">
                      <p className="text-4xl">{category.icon}</p>
                      <div className="flex gap-2">
                        <EditIcon
                          onClick={() => {
                            setCategoryToEdit(category._id);
                            setOpen({ type: "EDIT", open: true });
                          }}
                          className="icon"
                        />
                        <Trash2
                          onClick={() => {
                            setCategoryToDelete(category._id);
                            setOpen({ type: "DELETE", open: true });
                          }}
                          className="icon"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center p-0">
                    <p className={`font-bold text-base`}>{category.category}</p>
                    <p className="text-base">
                      Budget:{" "}
                      <span className="font-bold">{category.budget}</span>
                    </p>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <ResponsiveDialogAndDrawer
        open={open.type === "DELETE" && open.open}
        handleClose={handleClose}
        title={"Delete Category"}
        content={
          <>
            <div>
              <Label>Are you sure you want to delete this category?</Label>
            </div>
            <div className="flex justify-between items-center mt-5">
              <Button type="reset" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleDeleteCategory}
                variant="destructive"
                loading={deleteCategory.isPending}
              >
                Delete
              </Button>
            </div>
          </>
        }
      />

      <ResponsiveDialogAndDrawer
        open={(open.type === "ADD" || open.type === "EDIT") && open.open}
        handleClose={handleClose}
        title={open.type === "ADD" ? "Add Category" : "Edit Category"}
        content={
          gettingCategoryById ? (
            <CategoryFormSkeleton />
          ) : (
            <CategoryForm
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              onReset={handleClose}
              submitText={open.type === "ADD" ? "Add" : "Update"}
            />
          )
        }
      />
    </>
  );
};

export default Category;
