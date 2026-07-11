"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, ErrorMessage as FormikErrorMessage } from "formik";
import * as Yup from "yup";
import { HiArrowLeft, HiEye, HiEyeOff } from "react-icons/hi";
import { loginApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/types";
import type { UserType } from "@/lib/types";
import Button from "./ui/Button";
import Input from "./ui/Input";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Must be a valid email Address")
    .required("Email Address is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType: UserType = searchParams.get("as") === "worker" ? "worker" : "client";

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between bg-navy text-white p-12 overflow-hidden">
        <button onClick={() => router.push("/")} className="flex items-center gap-1 text-white/70 hover:text-white w-fit">
          <HiArrowLeft /> Back to home
        </button>
        <div>
          <p className="font-heading text-3xl leading-snug max-w-sm">
            &ldquo;Verified skill, honest pay, real trust.&rdquo;
          </p>
          <p className="mt-4 text-white/70 text-sm">
            GuildWorkman connects clients with skilled tradespeople they can
            count on.
          </p>
        </div>
        <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-terra-deep/30" />
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <button onClick={() => router.push("/")} className="lg:hidden flex items-center gap-1 mb-8 text-muted">
            <HiArrowLeft /> Back
          </button>
          <h1 className="font-heading text-3xl font-semibold">Welcome back</h1>
          <p className="text-muted mt-2 mb-8">
            Log in {userType === "worker" ? "as a skilled worker" : "as a client"}
          </p>

          {errorMessage && (
            <div className="mb-4 bg-err/10 text-err text-sm p-3 rounded-xl">{errorMessage}</div>
          )}

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setLoading(true);
              setErrorMessage("");

              try {
                const response = await loginApi(values, userType);
                const { token, refreshToken, userId } = response.data.data;
                localStorage.setItem("accessToken", token);
                localStorage.setItem("refreshToken", refreshToken);
                localStorage.setItem("userId", userId);
                router.push("/book");
              } catch (error) {
                setErrorMessage(getErrorMessage(error, "An unexpected error occurred."));
              } finally {
                setLoading(false);
                setSubmitting(false);
              }
            }}
          >
            {({ values, handleChange, handleSubmit, isSubmitting }) => (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                  />
                  <FormikErrorMessage name="email" component="div" className="text-err text-xs mt-1" />
                </div>
                <div>
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-4 top-[38px] text-muted"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <HiEyeOff /> : <HiEye />}
                    </button>
                  </div>
                  <FormikErrorMessage name="password" component="div" className="text-err text-xs mt-1" />
                </div>

                <label className="flex items-center gap-2 text-sm text-ink mt-1">
                  <input type="checkbox" className="rounded border-line" />
                  Remember me
                </label>

                <Button type="submit" className="w-full mt-2" disabled={loading || isSubmitting}>
                  {loading ? "Logging in..." : "Log in"}
                </Button>
              </form>
            )}
          </Formik>

          <p className="mt-6 text-sm text-muted">
            Don&apos;t have an account?{" "}
            <button className="text-terra font-medium" onClick={() => router.push("/client")}>
              Sign up as client
            </button>{" "}
            or{" "}
            <button className="text-terra font-medium" onClick={() => router.push("/skilWok")}>
              sign up as worker
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
