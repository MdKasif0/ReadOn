"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // This should not be reachable if auth is null due to disabled form, but as a safeguard:
    if (!auth) {
        toast({
            variant: "destructive",
            title: "Authentication service not available",
            description: "Firebase is not configured on this server.",
        });
        return;
    }
    setIsLoading(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
      }
      router.push("/");
      toast({
        title: `Welcome!`,
        description: `You have successfully ${mode === 'login' ? 'logged in' : 'signed up'}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error.message,
      });
    } finally {
        setIsLoading(false);
    }
  }

  // If Firebase is not configured, authentication is not possible.
  if (!auth) {
    return (
        <Card className="w-full max-w-sm">
             <CardHeader>
                <CardTitle>{mode === "login" ? "Login" : "Sign Up"}</CardTitle>
                <CardDescription>
                {mode === "login"
                    ? "Enter your credentials to access your account."
                    : "Create an account to save your favorite articles."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Service Unavailable</AlertTitle>
                    <AlertDescription>
                        Authentication is currently disabled because the application is not configured with Firebase credentials.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Login" : "Sign Up"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Enter your credentials to access your account."
            : "Create an account to save your favorite articles."}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" ? "Login" : "Sign Up"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <Link
                href={mode === "login" ? "/signup" : "/login"}
                className="underline hover:text-primary"
              >
                {mode === "login" ? "Sign up" : "Login"}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
