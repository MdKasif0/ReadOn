import { Logo } from "@/components/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-background p-4 pt-20 sm:justify-center sm:pt-4">
       <div className="absolute top-4 left-4">
        <Link href="/" aria-label="Back to home">
          <Logo />
        </Link>
      </div>
      {children}
    </main>
  );
}
