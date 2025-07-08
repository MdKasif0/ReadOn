import { Newspaper } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <Newspaper className="h-7 w-7" />
      <span className="text-xl font-bold tracking-tight">ReadOn</span>
    </div>
  );
}
