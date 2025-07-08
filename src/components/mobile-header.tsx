import { Heart, Headphones } from "lucide-react";
import { Button } from "./ui/button";

interface MobileHeaderProps {
  title: string;
}

export function MobileHeader({ title }: MobileHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 pt-6 md:hidden">
      <h1 className="text-2xl font-bold tracking-tight text-primary">{title}</h1>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Headphones className="h-6 w-6 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Heart className="h-6 w-6 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
