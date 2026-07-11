"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, ErrorMessage as FormikErrorMessage } from "formik";
import * as Yup from "yup";
import { HiArrowLeft } from "react-icons/hi";
import { clientSignupApi, skillWorkerApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/types";
import type { RegistrationRequest, UserType } from "@/lib/types";
import Button from "./ui/Button";
import Input from "./ui/Input";

const validationSchema = Yup.object().shape({
  fullName: Yup.string()
    .matches(/^[a-zA-Z\s]+$/, "Full Name should only contain letters and spaces")
    .required("Full Name is required"),
  email: Yup.string().email("Invalid email address").required("Email Address is required"),
  password: Yup.string().required("Password is required"),
});

const initialValues: RegistrationRequest = { fullName: "", email: "", password: "" };

interface SignupFormProps {
  userType: UserType;
}

const quotes: Record<UserType, string> = {
  client: "Find someone reliable, fast — and know their work is verified.",
  worker: "Build a reputation that follows you, job after job.",
};

export default function SignupForm({ userType }: SignupFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const signupApi = userType === "worker" ? skillWorkerApi : clientSignupApi;

  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between bg-navy text-white p-12 overflow-hidden">
        <button onClick={() => router.push("/")} className="flex items-center gap-1 text-white/70 hover:text-white w-fit">
          <HiArrowLeft /> Back to home
        </button>
        <div>
          <p className="font-heading text-3xl leading-snug max-w-sm">&ldquo;{quotes[userType]}&rdquo;</p>
        </div>
        <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-terra-deep/30" />
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <button onClick={() => router.push("/")} className="lg:hidden flex items-center gap-1 mb-8 text-muted">
            <HiArrowLeft /> Back
          </button>
          <h1 className="font-heading text-3xl font-semibold">
            Join as a {userType === "worker" ? "skilled worker" : "client"}
          </h1>
          <p className="text-muted mt-2 mb-8">Create your GuildWorkman account.</p>

          {message && (
            <div className={`mb-4 text-sm p-3 rounded-xl ${isError ? "bg-err/10 text-err" : "bg-ok/10 text-ok"}`}>
              {message}
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setIsError(false);
              setMessage("");
              try {
                const response = await signupApi(values);
                setMessage(response.message || "Sign up successful!");
                setTimeout(() => router.push("/"), 500);
              } catch (error) {
                setMessage(getErrorMessage(error, "Sign up failed."));
                setIsError(true);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, handleChange, handleSubmit, isSubmitting }) => (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <Input label="Full name" type="text" name="fullName" value={values.fullName} onChange={handleChange} />
                  <FormikErrorMessage name="fullName" component="div" className="text-err text-xs mt-1" />
                </div>
                <div>
                  <Input label="Email" type="email" name="email" value={values.email} onChange={handleChange} />
                  <FormikErrorMessage name="email" component="div" className="text-err text-xs mt-1" />
                </div>
                <div>
                  <Input label="Password" type="password" name="password" value={values.password} onChange={handleChange} />
                  <FormikErrorMessage name="password" component="div" className="text-err text-xs mt-1" />
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                  Sign up as a {userType === "worker" ? "worker" : "client"}
                </Button>

                <p className="text-xs text-muted">
                  By signing up, you agree to our{" "}
                  <span className="underline">Terms of Service</span> and{" "}
                  <span className="underline">Privacy Policy</span>.
                </p>
              </form>
            )}
          </Formik>

          <p className="mt-6 text-sm text-muted">
            Already have an account?{" "}
            <button
              className="text-terra font-medium"
              onClick={() => router.push(userType === "worker" ? "/login?as=worker" : "/login")}
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
