
"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { Loader2, ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useSettings } from "@/providers/settings-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supportedCountries } from "@/lib/countries";
import { supportedLanguages } from "@/lib/languages";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { country, setCountry, language, setLanguage } = useSettings();

  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    if (!auth) return;
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
  
  return (
    <div className="pb-16">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-xl font-semibold">
                Settings
            </h1>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-2xl space-y-8">
                {/* Pro Card */}
                <div className="relative flex flex-col justify-end overflow-hidden rounded-2xl bg-card p-6 text-white shadow-lg h-56">
                    <Image 
                        src="/readon-pro.png"
                        alt="ReadOn Pro"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold">ReadOn Pro</h2>
                        <p className="mt-1 text-sm text-neutral-300">Upgrade to the latest AI models and boost your Pro Search usage.</p>
                        <Button className="mt-4 bg-white text-black hover:bg-neutral-200">Learn more</Button>
                    </div>
                </div>

                {/* Account Section */}
                <div>
                    <h3 className="mb-4 text-sm font-semibold text-accent">Account</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="font-medium">Email</p>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                         <Button onClick={handleLogout} className="w-full sm:w-auto" variant="outline" disabled={!auth}>
                            Log Out
                        </Button>
                    </div>
                </div>
                
                <Separator />

                {/* Preferences Section */}
                <div>
                     <h3 className="mb-4 text-sm font-semibold text-accent">Preferences</h3>
                     <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                             <Label htmlFor="country-select" className="font-medium">Default Country</Label>
                             <p className="text-sm text-muted-foreground">Set your default country for news articles.</p>
                             <Select value={country} onValueChange={setCountry}>
                                 <SelectTrigger id="country-select" className="w-full sm:max-w-xs">
                                     <SelectValue placeholder="Select a country" />
                                 </SelectTrigger>
                                 <SelectContent>
                                     {supportedCountries.map(c => (
                                         <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                                     ))}
                                 </SelectContent>
                             </Select>
                         </div>
                         <div className="flex flex-col gap-2">
                             <Label htmlFor="language-select" className="font-medium">Default Language</Label>
                              <p className="text-sm text-muted-foreground">Set your default language for news articles.</p>
                             <Select value={language} onValueChange={setLanguage}>
                                 <SelectTrigger id="language-select" className="w-full sm:max-w-xs">
                                     <SelectValue placeholder="Select a language" />
                                 </SelectTrigger>
                                 <SelectContent>
                                     {supportedLanguages.map(l => (
                                         <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                                     ))}
                                 </SelectContent>
                             </Select>
                         </div>
                     </div>
                </div>

                <Separator />

                {/* Appearance Section */}
                <div>
                    <h3 className="mb-4 text-sm font-semibold text-accent">Appearance</h3>
                    <div className="flex items-center justify-between">
                         <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-muted-foreground">Toggle between light and dark themes.</p>
                        </div>
                        <Switch
                            id="dark-mode"
                            checked={theme === 'dark'}
                            onCheckedChange={(checked) => {
                                setTheme(checked ? 'dark' : 'light')
                            }}
                            aria-label="Toggle Dark Mode"
                        />
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
}
