// Grid layout for displaying slates
import { Slate } from "@/types/proposal";
import { SlateCard } from "./SlateCard";
import { Skeleton } from "@/components/ui/skeleton";

interface SlateGridProps {
  slates: Slate[];
  filter?: "active" | "ended" | "all";
  loading?: boolean;
}

export function SlateGrid({ slates, filter = "all", loading }: SlateGridProps) {
  // Filter slates based on status
  const filtered_slates = slates.filter(slate => {
    if (filter === "all") return true;
    if (filter === "active") return slate.is_active;
    if (filter === "ended") return !slate.is_active;
    return true;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    );
  }

  if (filtered_slates.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No slates found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered_slates.map(slate => (
        <SlateCard key={slate.id.toString()} slate={slate} />
      ))}
    </div>
  );
}
