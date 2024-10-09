"use client";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { queryKeys } from "@/utils/queryKeys";
import { updateProfile, getProfile } from "../../../server/actions/profile";
import { convertServerResponse } from "@/utils/convertServerResponse";
// import { getProfileApi } from "@/ajax/profileApi";
// import { updateProfile } from "@/ajax/profileApi";

export const ProfileInitialValues = {
  name: "",
  budget: 0,
  _id: "",
};

type UpdateProfilePayload = typeof ProfileInitialValues;

const UpdateProfile = () => {
  const queryClient = useQueryClient();
  const { data: userData } = useQuery({
    queryKey: [queryKeys.profile],
    queryFn: () => getProfile(),
  });
  const { mutate: updatePasswordFn, isPending: isProfileUpdating } =
    useMutation({
      mutationFn: (data: UpdateProfilePayload) => updateProfile(data),
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: [queryKeys.profile] });
      },
      onError(error) {
        toast.error(error?.message);
      },
    });

  React.useEffect(() => {
    if (userData?.data) {
      updateProfileFormik.setValues(convertServerResponse(userData.data));
    }
  }, [userData]);

  const updateProfileFormik = useFormik({
    initialValues: ProfileInitialValues,
    onSubmit: (value) => updatePasswordFn(value),
  });

  return (
    <FormikProvider value={updateProfileFormik}>
      <Card className="w-full max-w-sm shadow-md shadow-selected">
        <Form onSubmit={updateProfileFormik.handleSubmit}>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Update your details</CardDescription>
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
                  <Input {...field} id="userName" type="text" />
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
                  <Input {...field} id="monthlyBudget" type="number" />
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
            <Button type="submit" disabled={isProfileUpdating}>
              Update Profile
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </FormikProvider>
  );
};

export default UpdateProfile;
