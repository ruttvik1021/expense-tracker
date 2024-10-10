"use client";
import { convertServerResponse } from "@/utils/convertServerResponse";
import { queryKeys } from "@/utils/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Field,
  FieldInputProps,
  FieldMetaProps,
  Form,
  FormikProvider,
  useFormik,
} from "formik";
import React from "react";
import { toast } from "sonner";
import {
  getProfile,
  updateProfile,
} from "../../../server/actions/profile/profile";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export const ProfileInitialValues = {
  name: "",
  budget: 0,
};

type UpdateProfilePayload = typeof ProfileInitialValues;

const UpdateProfile = () => {
  const queryClient = useQueryClient();
  const { mutate: updatePasswordFn, isPending: isProfileUpdating } =
    useMutation({
      mutationFn: (data: UpdateProfilePayload) => updateProfile(data),
      onSettled(data) {
        if (data?.error) {
          toast.error(data.error);
        } else if (data?.data) {
          toast.success("Details updated successfully");
          queryClient.invalidateQueries({ queryKey: [queryKeys.profile] });
        }
      },
    });

  const { data: userData, isLoading } = useQuery({
    queryKey: [queryKeys.profile],
    queryFn: () => getProfile(),
  });

  const updateProfileFormik = useFormik({
    initialValues: ProfileInitialValues,
    onSubmit: (value) => updatePasswordFn(value),
  });

  // Use useEffect to set form values when the query has data
  React.useEffect(() => {
    if (userData?.data) {
      updateProfileFormik.setValues(convertServerResponse(userData.data));
    } else if (userData?.error) {
      toast.error(userData?.error);
    }
  }, [userData]);

  return (
    <FormikProvider value={updateProfileFormik}>
      <Card className="w-full max-w-sm shadow-md shadow-selected">
        <Form onSubmit={updateProfileFormik.handleSubmit}>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your account details here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field name="name">
              {({
                field,
                meta,
              }: {
                field: FieldInputProps<string>;
                meta: FieldMetaProps<string>;
              }) => (
                <div className="space-y-2">
                  <Label htmlFor="userName">Name</Label>
                  <Input
                    {...field}
                    id="userName"
                    type="text"
                    disabled={isProfileUpdating || isLoading}
                  />
                  {meta.touched && meta.error && (
                    <Label className="text-base text-red-600 dark:text-red-600 pl-2">
                      {meta.error}
                    </Label>
                  )}
                </div>
              )}
            </Field>
            <Field name="budget">
              {({
                field,
                meta,
              }: {
                field: FieldInputProps<string>;
                meta: FieldMetaProps<string>;
              }) => (
                <div className="space-y-2">
                  <Label htmlFor="monthlyBudget">Monthly Budget</Label>
                  <Input
                    {...field}
                    id="monthlyBudget"
                    type="number"
                    disabled={isProfileUpdating || isLoading}
                  />
                  {meta.touched && meta.error && (
                    <Label className="text-base text-red-600 dark:text-red-600 pl-2">
                      {meta.error}
                    </Label>
                  )}
                </div>
              )}
            </Field>
          </CardContent>
          <CardFooter>
            <Button type="submit" loading={isProfileUpdating || isLoading}>
              Update Profile
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </FormikProvider>
  );
};

export default UpdateProfile;
