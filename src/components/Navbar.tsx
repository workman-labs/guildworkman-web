"use client";

import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export default function Navbar() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
      <div className="text-xl font-semibold">GuildWorkman</div>

      <div className="hidden md:flex gap-6 text-sm text-slate-300">
        <p>Home</p>
        <p>Skills</p>
        <p>Clients</p>
      </div>

      <Stack spacing={1} direction="row" sx={{ flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          size="small"
          sx={{ color: "white", borderColor: "#5a97d9" }}
          onClick={() => router.push("/login")}
        >
          Login
        </Button>
        <Button
          variant="outlined"
          size="small"
          sx={{ color: "white", borderColor: "#5a97d9" }}
          onClick={() => router.push("/skilWok")}
        >
          Sign up as skilled worker
        </Button>
        <Button
          variant="outlined"
          size="small"
          sx={{ color: "white", borderColor: "#5a97d9" }}
          onClick={() => router.push("/client")}
        >
          Sign up as client
        </Button>
        <Button
          variant="outlined"
          size="small"
          sx={{ color: "white", borderColor: "#5a97d9" }}
          onClick={() => router.push("/book")}
        >
          Book Appointment
        </Button>
      </Stack>
    </div>
  );
}
