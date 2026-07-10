import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface Worker {
  name: string;
  experience: string;
}

const workerData: Record<string, Worker[]> = {
  electrical: [
    { name: "John Doe", experience: "5 years" },
    { name: "Jane Smith", experience: "3 years" },
  ],
  plumbing: [
    { name: "Bob Johnson", experience: "4 years" },
    { name: "Alice Davis", experience: "6 years" },
  ],
  beauty: [
    { name: "Mary Brown", experience: "2 years" },
    { name: "Linda Miller", experience: "8 years" },
  ],
  carpentry: [
    { name: "James Wilson", experience: "10 years" },
    { name: "Patricia Garcia", experience: "5 years" },
  ],
  fashion: [
    { name: "Robert Martinez", experience: "7 years" },
    { name: "Jennifer Lopez", experience: "4 years" },
  ],
  photography: [
    { name: "Michael Anderson", experience: "3 years" },
    { name: "Elizabeth Taylor", experience: "6 years" },
  ],
};

export default async function WorkerProfilesPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const workers = workerData[category] ?? [];
  const title = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold mb-6 text-center">{title} Workers</h1>
      {workers.length > 0 ? (
        <div className="flex flex-col gap-3">
          {workers.map((worker, index) => (
            <Card key={index} className="p-4 flex items-center justify-between">
              <h3 className="font-medium text-ink-900">{worker.name}</h3>
              <div className="flex gap-1.5">
                <Badge tone="gold">{worker.experience} experience</Badge>
                <Badge tone="chain">Escrow protected</Badge>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-ink-500">No workers available in this category.</p>
      )}
    </div>
  );
}
