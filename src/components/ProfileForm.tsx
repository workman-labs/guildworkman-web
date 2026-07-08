"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";

interface ProfileFormValues {
  fullName: string;
  phoneNumber?: string;
  email: string;
  dob?: string;
  gender: string;
  accountType: string;
}

const navItems = [
  { icon: "fa-home", label: "Dashboard" },
  { icon: "fa-calendar-alt", label: "Appointment" },
  { icon: "fa-user", label: "My Profile", active: true },
  { icon: "fa-lock", label: "Login Details" },
  { icon: "fa-envelope", label: "Message" },
  { icon: "fa-question-circle", label: "Help" },
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
    <div className="flex flex-col md:flex-row min-h-[70vh]">
      <aside className="w-full md:w-56 bg-slate-900 text-white p-6">
        <h2 className="text-lg font-semibold mb-6">GuildWorkman</h2>
        <nav>
          <ul className="flex flex-col gap-3 text-sm">
            {navItems.map((item) => (
              <li
                key={item.label}
                className={`flex items-center gap-2 ${item.active ? "text-blue-400 font-medium" : "text-slate-300"}`}
              >
                <i className={`fas ${item.icon}`} /> {item.label}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-semibold">Profile Information</h1>
        <p className="text-slate-500 mb-4">Update your personal information below.</p>

        {successMessage && <p className="text-green-600 mb-4">Saved successfully!</p>}

        <div className="max-w-xl">
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-lg p-6 text-center mb-6 cursor-pointer"
          >
            <input {...getInputProps()} />
            {profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profileImage} alt="Profile" className="mx-auto h-32 w-32 object-cover rounded-full" />
            ) : isDragActive ? (
              <p>Drop the image here ...</p>
            ) : (
              <p>
                Click to upload or drag and drop
                <br />
                SVG, PNG, JPG or GIF (max 400 x 400px)
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm">
              Full Name *
              <input
                type="text"
                placeholder="Enter your full name"
                className="border rounded px-3 py-2"
                {...register("fullName", { required: "Full name is required" })}
              />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Phone Number
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="border rounded px-3 py-2"
                {...register("phoneNumber", { pattern: /^[0-9]+$/ })}
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm">Invalid phone number</p>}
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Email *
              <input
                type="email"
                placeholder="Enter your email"
                className="border rounded px-3 py-2"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Date of Birth
              <input type="date" className="border rounded px-3 py-2" {...register("dob")} />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Gender
              <select className="border rounded px-3 py-2" {...register("gender")}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Account Type
              <select className="border rounded px-3 py-2" {...register("accountType")}>
                <option value="skilled-worker">Skilled Worker</option>
                <option value="client">Client</option>
              </select>
            </label>

            <button type="submit" className="bg-blue-600 text-white rounded-full py-2 mt-2">
              Save Changes
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
