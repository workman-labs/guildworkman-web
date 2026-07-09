import Image from "next/image";
import type { SkillDetail } from "@/lib/constants";
import Card from "./ui/Card";
import Badge from "./ui/Badge";

export default function SkillCard({ image, name, skill, description }: SkillDetail) {
  return (
    <Card className="flex gap-4 p-4 mb-4">
      <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden">
        <Image src={image} alt={name} fill className="object-cover" sizes="80px" />
      </div>
      <div>
        <p className="font-medium text-ink-900">{name}</p>
        <Badge tone="brand" className="mt-1 mb-2">
          {skill}
        </Badge>
        <p className="text-sm text-ink-500">{description}</p>
      </div>
    </Card>
  );
}
