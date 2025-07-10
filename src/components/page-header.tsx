
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AuthButton } from "@/components/auth-button";
import { SearchForm } from "@/components/search-form";
import { useRouter } from "next/navigation";

export function PageHeader() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1">
        <SearchForm onSearch={(query) => router.push(`/feed?q=${encodeURIComponent(query)}`)} />
      </div>
      <div className="flex items-center gap-2">
        <AuthButton />
      </div>
    </header>
  );
}
