"use client";

import { AjaxUtils } from "@/ajax/ajax";
import { loginApi } from "@/ajax/authApi";
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
import { queryKeys } from "@/utils/queryKeys";
import { ILogin } from "@/utils/types";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { Field, FormikProvider, useFormik } from "formik";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as Yup from "yup";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Required"),
  password: Yup.string().required("Required"),
});

const Login = () => {
  const router = useRouter();
  const { mutate: loginMutate, isPending: isLogging } = useMutation({
    mutationKey: ["login"],
    mutationFn: (data: ILogin) => loginApi(data),
    onSuccess(data) {
      toast.success(data.data?.message);
      router.push("/dashboard");
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
      loginMutate(values);
    },
  });

  return (
    <FormikProvider value={formik}>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Field name="email">
              {({ field, meta }: any) => (
                <div className="my-2">
                  <Label htmlFor={"email"}>Email</Label>
                  <span className="text-red-600 ml-1">*</span>
                  <Input type={"text"} {...field} autoComplete="false" />
                  {meta.touched && meta.error && (
                    <div className="text-sm text-red-600">{meta.error}</div>
                  )}
                </div>
              )}
            </Field>
          </div>
          <div className="grid gap-2">
            <Field name="password">
              {({ field, meta }: any) => (
                <div className="my-2">
                  <Label htmlFor={"password"}>Password</Label>
                  <span className="text-red-600 ml-1">*</span>
                  <Input type={"password"} {...field} autoComplete="false" />
                  {meta.touched && meta.error && (
                    <div className="text-sm text-red-600">{meta.error}</div>
                  )}
                </div>
              )}
            </Field>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => formik.handleSubmit()}
            disabled={isLogging}
          >
            Sign in
          </Button>
        </CardFooter>
      </Card>
    </FormikProvider>
  );
};

export default Login;
