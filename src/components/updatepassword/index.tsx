"use client";
import { updatePassword } from "@/ajax/profileApi";
import { useMutation } from "@tanstack/react-query";
import {
  Field,
  FieldInputProps,
  FieldMetaProps,
  Form,
  FormikProvider,
  useFormik,
} from "formik";
import { toast } from "sonner";
import * as Yup from "yup";
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

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Required"),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Required"),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Required"),
});

export const PasswordInitialValues = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

type UpdatePasswordPayload = Omit<
  typeof PasswordInitialValues,
  "confirmNewPassword"
>;

const UpdatePassword = () => {
  const handlePasswordSubmit = (values: typeof PasswordInitialValues) => {
    const payload = {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    };
    updatePasswordFn(payload);
  };

  const { mutate: updatePasswordFn, isPending: isUpdating } = useMutation({
    mutationFn: (data: UpdatePasswordPayload) => updatePassword(data),
    onSuccess(data) {
      toast.success(data.data?.message);
      updatePasswordFormik.resetForm();
    },
    onError(error) {
      toast.error(error?.message);
    },
  });

  const updatePasswordFormik = useFormik({
    initialValues: PasswordInitialValues,
    validationSchema: PasswordSchema,
    onSubmit: handlePasswordSubmit,
  });

  return (
    <div className="flex items-center justify-center mt-5">
      <Card className="w-full max-w-sm shadow-md shadow-selected ">
        <FormikProvider value={updatePasswordFormik}>
          <Form onSubmit={updatePasswordFormik.handleSubmit}>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field name="currentPassword">
                {({
                  field,
                  meta,
                }: {
                  field: FieldInputProps<string>;
                  meta: FieldMetaProps<string>;
                }) => (
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input {...field} id="currentPassword" type="password" />
                    {meta.touched && meta.error && (
                      <Label className="text-base text-red-600 dark:text-red-600 pl-2">
                        {meta.error}
                      </Label>
                    )}
                  </div>
                )}
              </Field>
              <Field name="newPassword">
                {({
                  field,
                  meta,
                }: {
                  field: FieldInputProps<string>;
                  meta: FieldMetaProps<string>;
                }) => (
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input {...field} id="newPassword" type="password" />
                    {meta.touched && meta.error && (
                      <Label className="text-base text-red-600 dark:text-red-600 pl-2">
                        {meta.error}
                      </Label>
                    )}
                  </div>
                )}
              </Field>
              <Field name="confirmNewPassword">
                {({
                  field,
                  meta,
                }: {
                  field: FieldInputProps<string>;
                  meta: FieldMetaProps<string>;
                }) => (
                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">
                      Confirm New Password
                    </Label>
                    <Input {...field} id="confirmNewPassword" type="password" />
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
              <Button type="submit" disabled={isUpdating}>
                Update Password
              </Button>
            </CardFooter>
          </Form>
        </FormikProvider>
      </Card>
    </div>
  );
};

export default UpdatePassword;
