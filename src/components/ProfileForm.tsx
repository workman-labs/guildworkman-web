"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import {
  HiHome,
  HiCalendar,
  HiUser,
  HiShieldCheck,
  HiLockClosed,
  HiMail,
  HiQuestionMarkCircle,
  HiUpload,
} from "react-icons/hi";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Card from "./ui/Card";

interface ProfileFormValues {
  fullName: string;
  phoneNumber?: string;
  email: string;
  dob?: string;
  gender: string;
  accountType: string;
}

const navItems = [
  { icon: HiHome, label: "Dashboard" },
  { icon: HiCalendar, label: "Appointment" },
  { icon: HiUser, label: "My Profile", active: true },
  { icon: HiShieldCheck, label: "Verify Identity", href: "/verify-identity" },
  { icon: HiLockClosed, label: "Login Details" },
  { icon: HiMail, label: "Message" },
  { icon: HiQuestionMarkCircle, label: "Help" },
];

export default function ProfileForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setProfileImage(URL.createObjectURL(acceptedFiles[0]));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const onSubmit = () => {
    setSuccessMessage(true);
    setTimeout(() => setSuccessMessage(false), 3000);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
      <aside className="w-full md:w-64 bg-navy text-white p-6">
        <h2 className="font-heading text-lg font-semibold mb-8">My Account</h2>
        <nav>
          <ul className="flex flex-col gap-1 text-sm">
            {navItems.map((item) => {
              const itemClassName = `flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                item.active ? "bg-terra text-white font-medium" : "text-white/70 hover:bg-white/5"
              }`;
              return (
                <li key={item.label}>
                  {item.href ? (
                    <Link href={item.href} className={itemClassName}>
                      <item.icon className="text-lg" /> {item.label}
                    </Link>
                  ) : (
                    <span className={itemClassName}>
                      <item.icon className="text-lg" /> {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 p-8 md:p-12 bg-sand-2">
        <h1 className="font-heading text-2xl font-semibold">Profile Information</h1>
        <p className="text-muted mb-6">Update your personal information below.</p>

        {successMessage && (
          <div className="mb-6 bg-ok/10 text-ok text-sm p-3 rounded-xl max-w-xl">
            Saved successfully!
          </div>
        )}

        <Card className="p-6 md:p-8 max-w-xl">
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-line rounded-2xl p-8 text-center mb-6 cursor-pointer hover:border-navy-2 transition-colors"
          >
            <input {...getInputProps()} />
            {profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profileImage} alt="Profile" className="mx-auto h-28 w-28 object-cover rounded-full" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted">
                <HiUpload className="text-3xl text-terra" />
                {isDragActive ? (
                  <p>Drop the image here...</p>
                ) : (
                  <p className="text-sm">
                    Click to upload or drag and drop
                    <br />
                    SVG, PNG, JPG or GIF (max 400 x 400px)
                  </p>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <Input
                label="Full Name *"
                placeholder="Enter your full name"
                {...register("fullName", { required: "Full name is required" })}
              />
              {errors.fullName && <p className="text-err text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <Input
                label="Phone Number"
                type="tel"
                placeholder="Enter your phone number"
                {...register("phoneNumber", { pattern: /^[0-9]+$/ })}
              />
              {errors.phoneNumber && <p className="text-err text-xs mt-1">Invalid phone number</p>}
            </div>

            <div>
              <Input
                label="Email *"
                type="email"
                placeholder="Enter your email"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="text-err text-xs mt-1">{errors.email.message}</p>}
            </div>

            <Input label="Date of Birth" type="date" {...register("dob")} />

            <Select label="Gender" {...register("gender")}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>

            <Select label="Account Type" {...register("accountType")}>
              <option value="skilled-worker">Skilled Worker</option>
              <option value="client">Client</option>
            </Select>

            <Button type="submit" className="mt-2">
              Save Changes
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
