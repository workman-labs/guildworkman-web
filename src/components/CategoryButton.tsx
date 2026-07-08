interface CategoryButtonProps {
  categoryName: string;
  active?: boolean;
  onClick: () => void;
}

export default function CategoryButton({ categoryName, active, onClick }: CategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left px-4 py-2 rounded-md border mb-2 ${
        active ? "bg-blue-600 text-white border-blue-600" : "border-slate-300 hover:bg-slate-50"
      }`}
    >
      {categoryName}
    </button>
  );
}
