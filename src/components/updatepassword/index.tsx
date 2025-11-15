"use client";
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
import { updatePassword } from "../../../server/actions/profile/profile";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm new password is required"),
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
    onSettled(data) {
      if (data?.error) {
        toast.error(data.error);
      } else if (data?.message) {
        toast.success(data.message);
        updatePasswordFormik.resetForm();
      }
    },
  });

  const updatePasswordFormik = useFormik({
    initialValues: PasswordInitialValues,
    validationSchema: PasswordSchema,
    onSubmit: handlePasswordSubmit,
  });

  return (
    <FormikProvider value={updatePasswordFormik}>
      <Form onSubmit={updatePasswordFormik.handleSubmit}>
        <div className="grid gap-4 md:grid-cols-4 items-end">
          <div className="space-y-2">
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
                  <Input
                    {...field}
                    id="currentPassword"
                    type="password"
                    disabled={isUpdating}
                  />
                  {meta.touched && meta.error && (
                    <Label className="text-lg text-red-600 dark:text-red-600 pl-2">
                      {meta.error}
                    </Label>
                  )}
                </div>
              )}
            </Field>
          </div>
          <div className="space-y-2">
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
                  <Input
                    {...field}
                    id="newPassword"
                    type="password"
                    disabled={isUpdating}
                  />
                  {meta.touched && meta.error && (
                    <Label className="text-lg text-red-600 dark:text-red-600 pl-2">
                      {meta.error}
                    </Label>
                  )}
                </div>
              )}
            </Field>
          </div>
          <div className="space-y-2">
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
                  <Input
                    {...field}
                    id="confirmNewPassword"
                    type="password"
                    disabled={isUpdating}
                  />
                  {meta.touched && meta.error && (
                    <Label className="text-lg text-red-600 dark:text-red-600 pl-2">
                      {meta.error}
                    </Label>
                  )}
                </div>
              )}
            </Field>
          </div>
          <div className="space-y-2">
            <Button type="submit" loading={isUpdating}>
              Update Password
            </Button>
          </div>
        </div>
      </Form>
    </FormikProvider>
  );
};

export default UpdatePassword;
