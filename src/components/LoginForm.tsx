"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import { Formik, ErrorMessage as FormikErrorMessage } from "formik";
import * as Yup from "yup";
import { HiArrowLeft } from "react-icons/hi";
import { loginApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/types";
import type { UserType } from "@/lib/types";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Must be a valid email Address")
    .required("Email Address is required"),
  password: Yup.string().required("Password is required"),
});

const roundedStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "9999px",
  },
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType: UserType = searchParams.get("as") === "worker" ? "worker" : "client";

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  return (
    <div>
      <div className="fixed top-14 right-5 m-10 p-5 h-full z-50">
        {errorMessage && (
          <div className="bg-white text-xl text-red-700 p-5 h-20 rounded-xl shadow-md">
            {errorMessage}
          </div>
        )}
      </div>
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
          <div className="max-w-md mx-auto px-6 py-12">
            <button onClick={() => router.push("/")} className="flex items-center gap-1 mb-6 text-slate-600">
              <HiArrowLeft /> Back
            </button>
            <h2 className="text-2xl font-semibold mb-6">
              Log in {userType === "worker" ? "as a skilled worker" : "as a client"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  sx={roundedStyle}
                />
                <Button onClick={() => setShowPassword((s) => !s)}>
                  {showPassword ? "Hide" : "Show"}
                </Button>
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
                  "&:hover": { backgroundColor: "#2b8fda" },
                }}
                disabled={loading || isSubmitting}
              >
                {loading ? "Loading..." : "Log in"}
              </Button>
            </form>
            <FormGroup>
              <FormControlLabel required control={<Checkbox />} label="Remember me" />
            </FormGroup>
            <p className="mt-4 text-sm">
              Don&apos;t have an Account?{" "}
              <button className="text-blue-600 underline mx-1" onClick={() => router.push("/client")}>
                Signup as client
              </button>
              <button className="text-blue-600 underline mx-1" onClick={() => router.push("/skilWok")}>
                Signup as worker
              </button>
            </p>
          </div>
        )}
      </Formik>
    </div>
  );
}
