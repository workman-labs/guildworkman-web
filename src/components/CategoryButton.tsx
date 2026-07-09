interface CategoryButtonProps {
  categoryName: string;
  active?: boolean;
  onClick: () => void;
}

export default function CategoryButton({ categoryName, active, onClick }: CategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium mb-2 transition-colors ${
        active ? "bg-brand-500 text-cream" : "bg-white border border-ink-100 text-ink-700 hover:border-brand-300"
      }`}
    >
      {categoryName}
    </button>
  );
}
