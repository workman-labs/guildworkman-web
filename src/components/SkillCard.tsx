import type { SkillDetail } from "@/lib/constants";

export default function SkillCard({ image, name, skill, description }: SkillDetail) {
  return (
    <div className="flex gap-4 border rounded-lg p-4 mb-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={name} className="h-20 w-20 object-cover rounded" />
      <div>
        <p className="font-medium">{name}</p>
        <h4 className="text-blue-600 text-sm">{skill}</h4>
        <div className="text-sm text-slate-500">{description}</div>
      </div>
    </div>
  );
}
