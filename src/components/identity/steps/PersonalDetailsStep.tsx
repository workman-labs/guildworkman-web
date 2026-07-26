import { useFormContext } from "react-hook-form";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { IdentityVerificationFormValues } from "@/lib/identityVerification";

const NATIONALITIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United Kingdom",
  "United States",
  "Other",
];

export default function PersonalDetailsStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<IdentityVerificationFormValues>();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Input
          label="Full legal name *"
          placeholder="As it appears on your ID"
          {...register("personal.fullName", { required: "Full name is required" })}
        />
        {errors.personal?.fullName && (
          <p className="text-err text-xs mt-1">{errors.personal.fullName.message}</p>
        )}
      </div>

      <div>
        <Input
          label="Date of birth *"
          type="date"
          {...register("personal.dateOfBirth", { required: "Date of birth is required" })}
        />
        {errors.personal?.dateOfBirth && (
          <p className="text-err text-xs mt-1">{errors.personal.dateOfBirth.message}</p>
        )}
      </div>

      <div>
        <Select
          label="Nationality *"
          {...register("personal.nationality", { required: "Nationality is required" })}
        >
          <option value="">Select nationality</option>
          {NATIONALITIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </Select>
        {errors.personal?.nationality && (
          <p className="text-err text-xs mt-1">{errors.personal.nationality.message}</p>
        )}
      </div>

      <div>
        <Input
          label="Phone number *"
          type="tel"
          placeholder="e.g. 08012345678"
          {...register("personal.phoneNumber", {
            required: "Phone number is required",
            pattern: { value: /^[0-9+\s-]+$/, message: "Invalid phone number" },
          })}
        />
        {errors.personal?.phoneNumber && (
          <p className="text-err text-xs mt-1">{errors.personal.phoneNumber.message}</p>
        )}
      </div>
    </div>
  );
}
