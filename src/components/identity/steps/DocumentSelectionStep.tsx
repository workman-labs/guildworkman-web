import { useFormContext } from "react-hook-form";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { IdentityVerificationFormValues } from "@/lib/identityVerification";

export default function DocumentSelectionStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<IdentityVerificationFormValues>();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Select
          label="Document type *"
          {...register("document.documentType", { required: "Please choose a document type" })}
        >
          <option value="">Select a document</option>
          <option value="national-id">National ID</option>
          <option value="passport">Passport</option>
          <option value="drivers-license">Driver&apos;s license</option>
        </Select>
        {errors.document?.documentType && (
          <p className="text-err text-xs mt-1">{errors.document.documentType.message}</p>
        )}
      </div>

      <div>
        <Input
          label="Document number *"
          placeholder="As printed on the document"
          {...register("document.documentNumber", { required: "Document number is required" })}
        />
        {errors.document?.documentNumber && (
          <p className="text-err text-xs mt-1">{errors.document.documentNumber.message}</p>
        )}
      </div>
    </div>
  );
}
