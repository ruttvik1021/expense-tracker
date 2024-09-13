"use client";
import { createCategoryApi } from "@/ajax/categoryApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useDeviceType } from "@/hooks/useMediaQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Picker from "emoji-picker-react";
import {
  Field,
  FieldInputProps,
  FieldMetaProps,
  FormikProvider,
  useFormik,
} from "formik";
import { PlusCircleIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const AddButton = ({
  type,
  onClick,
}: {
  type: "Card" | "Button" | "Link";
  onClick: () => void;
}) => {
  const queryClient = useQueryClient();
  const isAdding = Boolean(
    queryClient.isMutating({
      mutationKey: ["category"],
    })
  );

  return type === "Card" ? (
    <Card className="p-4 min-w-32 cursor-pointer" onClick={onClick}>
      <CardHeader className="p-0">
        <PlusCircleIcon className="h-8 w-8 mb-2" />
      </CardHeader>
      <CardContent className="flex-col items-center p-0">
        <h3 className="font-semibold text-base">Add New</h3>
        <p className="text-base">Category</p>
      </CardContent>
      <CardFooter>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div className="bg-blue-600 h-1.5 rounded-full"></div>
        </div>
      </CardFooter>
    </Card>
  ) : (
    <Button
      className="flex gap-2 items-center"
      variant={type === "Button" ? "outline" : "link"}
      onClick={onClick}
      loading={isAdding}
    >
      <p>Add Category</p> <PlusCircleIcon />
    </Button>
  );
};

const CategoryForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const queryClient = useQueryClient();
  const [showPicker, setShowPicker] = React.useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEmojiClick = (_: any, emojiObject: any) => {
    console.log("emojiObject", emojiObject.target.currentSrc);
    formik.setFieldValue("icon", emojiObject.target.currentSrc);
    setShowPicker(false);
  };

  const { mutate: addCategory, isPending: isAddingCategory } = useMutation({
    mutationKey: ["category"],
    mutationFn: (data: typeof initialValues) => createCategoryApi(data),
    onSuccess(data) {
      toast.success(data.data?.message);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSuccess();
    },
    onError(error) {
      toast.error(error?.message);
    },
  });

  const validationSchema = Yup.object({
    icon: Yup.string().required("Icon is required"),
    category: Yup.string().required("Category is required"),
    budget: Yup.number().required("Budget is required"),
  });

  const initialValues = {
    icon: "",
    category: "",
    budget: 0,
  };

  const handleSubmit = async (values: typeof initialValues) => {
    addCategory(values);
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <FormikProvider value={formik}>
        <div className="my-2">
          <Avatar
            onClick={() => setShowPicker((val) => !val)}
            className="cursor-pointer p-1 border-2 border-selected"
          >
            <AvatarImage src={formik.values.icon} />
            <AvatarFallback>✏️</AvatarFallback>
          </Avatar>
          <Dialog open={showPicker} onOpenChange={setShowPicker}>
            <DialogContent className="w-auto p-0">
              <DialogDescription>
                <Picker className="w-full" onEmojiClick={onEmojiClick} />
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>
        <Field name="category">
          {({
            field,
          }: {
            field: FieldInputProps<typeof formik.values.category>;
          }) => (
            <div className="my-2">
              <Label htmlFor="category">Category:</Label>
              <Input
                {...field}
                type="text"
                id="category"
                placeholder="Category Name"
              />
            </div>
          )}
        </Field>
        <Field name="budget">
          {({
            field,
            meta,
          }: {
            field: FieldInputProps<typeof formik.values.budget>;
            meta: FieldMetaProps<typeof formik.errors.category>;
          }) => (
            <div className="my-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                {...field}
                type="number"
                autoComplete="off"
                placeholder="Budget"
              />
              {meta.touched && meta.error && (
                <div className="text-base text-red-600">{meta.error}</div>
              )}
            </div>
          )}
        </Field>
        <div className="flex justify-between">
          <Button
            type="reset"
            variant="outline"
            onClick={() => formik.resetForm()}
          >
            Clear
          </Button>
          <Button type="submit" variant="default" loading={isAddingCategory}>
            Add
          </Button>
        </div>
      </FormikProvider>
    </form>
  );
};

const AddCategory = ({ type }: { type: "Card" | "Button" | "Link" }) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const { isDesktop } = useDeviceType();

  const handleClose = () => {
    setOpen(false);
  };

  return isDesktop ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <AddButton type={type} onClick={() => setOpen(true)} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription>
            <CategoryForm onSuccess={handleClose} />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <AddButton type={type} onClick={() => setOpen(true)} />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add Category</DrawerTitle>
          <DrawerDescription>
            <CategoryForm onSuccess={handleClose} />
          </DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};

export default AddCategory;
