"use client";

import { signUpApi } from "@/ajax/authApi";
import { Button } from "@/components/ui/button";
import { Navlink } from "@/components/common/Navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import {
  Field,
  FieldInputProps,
  FieldMetaProps,
  FormikProvider,
  useFormik,
} from "formik";
import { toast } from "sonner";
import * as Yup from "yup";
import { useAuthContext } from "../wrapper/ContextWrapper";
import { IRegister } from "@/utils/types/authTypes";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/utils/queryKeys";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Required"),
  password: Yup.string()
    .min(8, "Must be at least 8 characters")
    .required("Required"),
  confirmPassword: Yup.string().required("Required"),
});

const Register = () => {
  const router = useRouter();
  const { authenticateUser } = useAuthContext();
  const { mutate: registerMutate, isPending: isRegistering } = useMutation({
    mutationKey: [queryKeys.user],
    mutationFn: (data: IRegister) => signUpApi(data),
    onSuccess(data) {
      authenticateUser(data.data?.token);
      router.push("/dashboard");
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
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      registerMutate(values);
    },
  });

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 flex items-center justify-center p-12">
        <form onSubmit={formik.handleSubmit} className="w-full max-w-md">
          <FormikProvider value={formik}>
            <div className="w-full max-w-md">
              <div className="flex items-center gap-3 mb-6">
                <svg
                  className="h-8 w-8 text-[#1380ec]"
                  fill="none"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z"
                    fill="currentColor"
                  ></path>
                  <path
                    clip-rule="evenodd"
                    d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z"
                    fill="currentColor"
                    fill-rule="evenodd"
                  ></path>
                </svg>
                <h1 className="text-2xl font-bold">FinTrack</h1>
              </div>
              <h2 className="text-4xl font-bold mb-2">Create an account</h2>
              <p className="text-primary mb-6">
                Sign up to start tracking your expenses.
              </p>
              <div className="my-3">
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
                        <div className="relative">
                          <Input
                            type={"text"}
                            {...field}
                            autoComplete="false"
                            disabled={isRegistering}
                          />
                          {meta.touched && meta.error && (
                            <div className="text-base text-red-600">
                              {meta.error}
                            </div>
                          )}
                        </div>
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
                        <div className="relative">
                          <Input
                            type={"password"}
                            {...field}
                            autoComplete="false"
                            disabled={isRegistering}
                          />
                          {meta.touched && meta.error && (
                            <div className="text-base text-red-600">
                              {meta.error}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Field>
                </div>
                <div className="grid gap-2">
                  <Field name="confirmPassword">
                    {({
                      field,
                      meta,
                    }: {
                      field: FieldInputProps<
                        typeof formik.values.confirmPassword
                      >;
                      meta: FieldMetaProps<
                        typeof formik.values.confirmPassword
                      >;
                    }) => (
                      <div className="my-2">
                        <Label htmlFor={"confirmPassword"}>
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Input
                            type={"password"}
                            {...field}
                            autoComplete="false"
                            disabled={isRegistering}
                          />
                          {meta.touched && meta.error && (
                            <div className="text-base text-red-600">
                              {meta.error}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Field>
                </div>
              </div>
              <Button
                className="w-full bg-primary"
                type="submit"
                disabled={
                  formik.values.password !== formik.values.confirmPassword ||
                  isRegistering
                }
                loading={isRegistering}
              >
                Register
              </Button>
              <p className="text-primary my-3">
                Already registered?{" "}
                <Navlink
                  link={{ href: "/login", label: "Login here" }}
                  className="font-medium text-blue-700"
                />
              </p>
            </div>
          </FormikProvider>
        </form>
      </div>
      <div className="w-1/2 bg-[#181c22] hidden md:flex items-center justify-center p-12">
        <div className="text-center">
          <span
            className="material-symbols-outlined text-9xl text-blue-700 mb-4"
            style={{ fontSize: 120 }}
          >
            FinTrack
          </span>
          <h2 className="text-4xl font-bold mb-4 text-primary-foreground">
            Track Expenses with AI
          </h2>
          <p className="text-primary-foreground max-w-md mx-auto">
            Gain insights into your spending habits and achieve your financial
            goals with our intelligent expense tracker.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
