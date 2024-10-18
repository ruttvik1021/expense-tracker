"use client";

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
import { ILogin } from "@/utils/types/authTypes";
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
import { useRouter } from "next/navigation";
import { queryKeys } from "@/utils/queryKeys";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Required"),
  password: Yup.string().required("Required"),
});

const Login = () => {
  const router = useRouter();
  const { authenticateUser } = useAuthContext();
  const { mutate: loginMutate, isPending: isLogging } = useMutation({
    mutationKey: [queryKeys.user],
    mutationFn: (data: ILogin) => loginApi(data),
    onSuccess(data) {
      authenticateUser(data.data?.token);
      router.push("/");
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
      loginMutate(values);
    },
  });

  return (
    <div className="h-[90vh] w-full flex justify-center items-center">
      <form onSubmit={formik.handleSubmit}>
        <FormikProvider value={formik}>
          <Card className="w-full max-w-sm shadow-selected ">
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your email below to login to your account.
              </CardDescription>
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
                        disabled={isLogging}
                      />
                      {meta.touched && meta.error && (
                        <div className="text-base text-red-600">
                          {meta.error}
                        </div>
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
                        disabled={isLogging}
                      />
                      {meta.touched && meta.error && (
                        <div className="text-base text-red-600">
                          {meta.error}
                        </div>
                      )}
                    </div>
                  )}
                </Field>
              </div>
              <Button
                className="w-full bg-primary"
                loading={isLogging}
                type="submit"
              >
                Sign in
              </Button>
            </CardContent>
            <CardFooter>
              Don't have an account ?{" "}
              <Link href={"/register"} className="ml-2 text-blue-700">
                Register here
              </Link>
            </CardFooter>
          </Card>
        </FormikProvider>
      </form>
    </div>
  );
};

export default Login;
