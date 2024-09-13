"use client";
import { deleteCategoryApi, getCategoryApi } from "@/ajax/categoryApi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useDeviceType } from "@/hooks/useMediaQuery";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EditIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Drawer } from "../ui/drawer";

const Category = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategoryApi(),
  });

  const { isDesktop } = useDeviceType();

  const [isConfirmationVisible, setConfirmationVisible] = useState<
    string | null
  >(null);

  const { mutate: deleteCategory, isPending: isCategoryDeleting } = useMutation(
    {
      mutationKey: [`delete-category`, isConfirmationVisible],
      mutationFn: (id: string) => deleteCategoryApi(id),
      onSuccess(data) {
        toast.success(data.data?.message);
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setConfirmationVisible(null);
      },
      onError(error) {
        toast.error(error?.message);
      },
    }
  );

  if (!data) return <div>Loading...</div>;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {data.data.categories.map((category: any) => (
          <>
            <Card key={category._id} className="p-4">
              <CardHeader className="p-0 mb-3">
                <div className="flex justify-between ">
                  <Avatar className="cursor-pointer p-1 border-2 border-selected">
                    <AvatarImage src={category.icon} />
                    <AvatarFallback>{category.category}</AvatarFallback>
                  </Avatar>
                  <div className="flex gap-2">
                    <EditIcon />
                    <Trash2
                      onClick={() => setConfirmationVisible(category._id)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-col items-center p-0">
                <h3 className="font-semibold text-base">{category.category}</h3>
                <p className="text-base">Budget: {category.budget}</p>
              </CardContent>
            </Card>
          </>
        ))}
      </div>
      {isConfirmationVisible ? (
        <>
          {isDesktop ? (
            <Dialog open={!!isConfirmationVisible}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Delete Category</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this category?
                  </DialogDescription>
                  <DialogFooter>
                    <Button
                      type="reset"
                      variant="outline"
                      onClick={() => setConfirmationVisible(null)}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={() => deleteCategory(isConfirmationVisible)}
                      variant="destructive"
                      loading={isCategoryDeleting}
                    >
                      Add
                    </Button>
                  </DialogFooter>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          ) : (
            <Drawer open={!!isConfirmationVisible}>
              <DrawerContent>
                <DrawerHeader className="text-left">
                  <DrawerTitle>Delete Category</DrawerTitle>
                  <DrawerDescription>
                    Are you sure you want to delete this category?
                  </DrawerDescription>
                </DrawerHeader>
                <div className="flex justify-between items-center p-5">
                  <Button
                    type="reset"
                    variant="outline"
                    onClick={() => setConfirmationVisible(null)}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={() => deleteCategory(isConfirmationVisible)}
                    variant="destructive"
                    loading={isCategoryDeleting}
                  >
                    Add
                  </Button>
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </>
      ) : null}
    </>
  );
};

export default Category;
