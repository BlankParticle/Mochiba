import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@web/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@web/components/ui/button";
import { authClient } from "@web/lib/auth-client";
import { Input } from "@web/components/ui/input";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as v from "valibot";

const loginSchema = v.object({
  username: v.pipe(
    v.string(),
    v.minLength(3, "Username should be at least 3 characters"),
    v.maxLength(64, "Username should be at most 64 characters"),
    v.regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
  ),
  password: v.pipe(v.string(), v.minLength(8, "Password must be at least 8 characters")),
});

export function LoginForm() {
  const navigate = useNavigate();
  const form = useForm<v.InferOutput<typeof loginSchema>>({
    resolver: valibotResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { mutateAsync: login, isPending } = useMutation({
    mutationFn: async (info: v.InferOutput<typeof loginSchema>) => {
      const { error } = await authClient.signIn.username({
        username: info.username,
        password: info.password,
        rememberMe: true,
      });
      if (error) throw new Error(error.message ?? error.statusText ?? "Unknown error");
      await navigate("/");
    },
    onError: (error) => toast.error(error.message),
    onSuccess: () => toast.success("Logged in, redirecting..."),
  });

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your username below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit((data) => login(data))}>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" loading={isPending}>
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="flex w-full flex-col justify-center gap-2 border-t py-2">
          <p className="text-center text-xs text-neutral-500">
            Don't have an account?{" "}
            <Link to="/create-account">
              <span className="underline">Create one</span>
            </Link>
          </p>
          <p className="text-center text-xs text-neutral-500">
            Powered by{" "}
            <Link to="https://better-auth.com" className="underline" target="_blank">
              <span className="dark:text-orange-200/90">better-auth.</span>
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
