"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, LogOut, User as UserIcon, Moon, Sun } from "lucide-react";
import { MobileHeader } from "@/components/mobile-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useSettings } from "@/providers/settings-provider";
import { supportedCountries } from "@/lib/countries";
import { supportedLanguages } from "@/lib/languages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { country, setCountry, language, setLanguage } = useSettings();

  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  if (loading || !mounted) {
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
            <div className="mx-auto max-w-md space-y-6 md:mx-0">
                <Card>
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

                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="dark-mode" className="flex items-center gap-2">
                                {theme === 'dark' ? <Moon className="h-5 w-5"/> : <Sun className="h-5 w-5" />}
                                Dark Mode
                            </Label>
                            <Switch
                                id="dark-mode"
                                checked={theme === 'dark'}
                                onCheckedChange={(checked) => {
                                    setTheme(checked ? 'dark' : 'light')
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Content Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="country-select">Country</Label>
                            <Select value={country} onValueChange={setCountry}>
                                <SelectTrigger id="country-select" className="w-[180px]">
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {supportedCountries.map((c) => (
                                        <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="language-select">Language</Label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger id="language-select" className="w-[180px]">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {supportedLanguages.map((l) => (
                                        <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
