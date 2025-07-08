"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, LogOut, User as UserIcon } from "lucide-react";
import { MobileHeader } from "@/components/mobile-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }
  
  const getInitials = (email: string | null) => {
    if (!email) return <UserIcon className="h-5 w-5" />;
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div>
        <div className="md:hidden">
            <MobileHeader title="Account" />
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="mb-6 hidden text-3xl font-bold tracking-tight text-primary md:block">
                Account
            </h1>
            <Card className="mx-auto max-w-md md:mx-0">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.photoURL ?? ""} alt={user.email ?? ""} />
                            <AvatarFallback className="text-2xl">{getInitials(user.email)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>{user.displayName || "User"}</CardTitle>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleLogout} className="w-full" variant="outline">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
