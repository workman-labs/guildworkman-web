"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Formik, ErrorMessage as FormikErrorMessage } from "formik";
import * as Yup from "yup";
import { HiArrowLeft } from "react-icons/hi";
import { clientSignupApi, skillWorkerApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/types";
import type { RegistrationRequest, UserType } from "@/lib/types";

const validationSchema = Yup.object().shape({
  fullName: Yup.string()
    .matches(/^[a-zA-Z\s]+$/, "Full Name should only contain letters and spaces")
    .required("Full Name is required"),
  email: Yup.string().email("Invalid email address").required("Email Address is required"),
  password: Yup.string().required("Password is required"),
});

const initialValues: RegistrationRequest = { fullName: "", email: "", password: "" };

const roundedStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "9999px",
  },
};

interface SignupFormProps {
  userType: UserType;
}

export default function SignupForm({ userType }: SignupFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const signupApi = userType === "worker" ? skillWorkerApi : clientSignupApi;

  return (
    <div>
      {message && (
        <div className="fixed top-14 right-5 m-10 p-5 h-full z-50">
          <div
            className={`p-5 rounded-xl shadow-md text-xl ${isError ? "bg-white text-red-700" : "bg-white text-green-700"}`}
          >
            {message}
          </div>
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
          <div className="max-w-md mx-auto px-6 py-12 relative">
            <button onClick={() => router.push("/")} className="flex items-center gap-1 mb-6 text-slate-600">
              <HiArrowLeft /> Back
            </button>
            <h2 className="text-2xl font-semibold mb-6">
              Sign up as a {userType === "worker" ? "skilled worker" : "client"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <TextField
                  label="Full Name"
                  variant="outlined"
                  fullWidth
                  type="text"
                  name="fullName"
                  value={values.fullName}
                  onChange={handleChange}
                  sx={roundedStyle}
                />
                <FormikErrorMessage name="fullName" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  sx={roundedStyle}
                />
                <FormikErrorMessage name="email" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <TextField
                  label="Password"
                  variant="outlined"
                  fullWidth
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  sx={roundedStyle}
                />
                <FormikErrorMessage name="password" component="div" className="text-red-500 text-sm" />
              </div>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: "#2b8fda",
                  color: "white",
                  paddingY: 2,
                  borderRadius: "9999px",
                }}
                disabled={isSubmitting}
              >
                Sign up as a {userType === "worker" ? "worker" : "client"}
              </Button>
              <p className="text-sm">
                Already have an Account?{" "}
                <button
                  type="button"
                  className="text-blue-600 underline"
                  onClick={() => router.push(userType === "worker" ? "/login?as=worker" : "/login")}
                >
                  Login
                </button>
              </p>
              <p className="text-xs text-slate-500">
                By clicking &apos;Sign up&apos;, you acknowledge that you have read and accept the{" "}
                <span className="underline">Terms of Service</span> and{" "}
                <span className="underline">Privacy Policy</span>.
              </p>
            </form>
          </div>
        )}
      </Formik>
    </div>
  );
}
