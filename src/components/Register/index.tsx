"use client";

import { signUpApi } from "@/ajax/authApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ILogin } from "@/utils/types";
import { useMutation } from "@tanstack/react-query";
import {
  Field,
  FieldInputProps,
  FieldMetaProps,
  FormikProvider,
  useFormik,
} from "formik";
import Link from "next/link";
import { toast } from "sonner";
import * as Yup from "yup";
import { useAuthContext } from "../wrapper/ContextWrapper";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Required"),
  password: Yup.string().required("Required"),
});

const Register = () => {
  const { authenticateUser } = useAuthContext();
  const { mutate: registerMutate, isPending: isRegistering } = useMutation({
    mutationKey: ["user"],
    mutationFn: (data: ILogin) => signUpApi(data),
    onSuccess(data) {
      authenticateUser(data.data?.token);
      toast.success(data.data?.message);
    },
    onError(error) {
      toast.error(error?.message);
    },
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      registerMutate(values);
    },
  });

  return (
    <FormikProvider value={formik}>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>Enter your email below to register.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Field name="email">
              {({
                field,
                meta,
              }: {
                field: FieldInputProps<typeof formik.values.email>;
                meta: FieldMetaProps<typeof formik.values.email>;
              }) => (
                <div className="my-2">
                  <Label htmlFor={"email"}>Email</Label>
                  <span className="text-red-600 ml-1">*</span>
                  <Input
                    type={"text"}
                    {...field}
                    autoComplete="false"
                    disabled={isRegistering}
                  />
                  {meta.touched && meta.error && (
                    <div className="text-sm text-red-600">{meta.error}</div>
                  )}
                </div>
              )}
            </Field>
          </div>
          <div className="grid gap-2">
            <Field name="password">
              {({
                field,
                meta,
              }: {
                field: FieldInputProps<typeof formik.values.password>;
                meta: FieldMetaProps<typeof formik.values.password>;
              }) => (
                <div className="my-2">
                  <Label htmlFor={"password"}>Password</Label>
                  <span className="text-red-600 ml-1">*</span>
                  <Input
                    type={"password"}
                    {...field}
                    autoComplete="false"
                    disabled={isRegistering}
                  />
                  {meta.touched && meta.error && (
                    <div className="text-sm text-red-600">{meta.error}</div>
                  )}
                </div>
              )}
            </Field>
          </div>
          <Button
            className="w-full bg-primary"
            onClick={() => formik.handleSubmit()}
            disabled={isRegistering}
          >
            Register
          </Button>
        </CardContent>
        <CardFooter>
          Already registered ?{" "}
          <Link href={"/login"} className="ml-2 text-blue-700">
            Login here
          </Link>
        </CardFooter>
      </Card>
    </FormikProvider>
  );
};

export default Register;
