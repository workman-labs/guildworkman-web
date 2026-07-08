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
  beauty_care: [
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
    <div className="max-w-2xl mx-auto px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold mb-6">{title} Workers</h1>
      {workers.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {workers.map((worker, index) => (
            <li key={index} className="border rounded-lg p-4">
              <h3 className="font-medium">{worker.name}</h3>
              <p className="text-slate-500">Experience: {worker.experience}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No workers available in this category.</p>
      )}
    </div>
  );
}
