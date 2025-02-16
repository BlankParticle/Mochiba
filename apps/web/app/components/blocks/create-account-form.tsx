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

const createAccountSchema = v.pipe(
  v.object({
    email: v.pipe(
      v.string(),
      v.email("Invalid email"),
      v.minLength(3, "Email is too short"),
      v.maxLength(64, "Email is too long"),
    ),
    username: v.pipe(
      v.string(),
      v.minLength(3, "Username should be at least 3 characters"),
      v.maxLength(64, "Username should be at most 64 characters"),
      v.regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
    ),
    password: v.pipe(v.string(), v.minLength(8, "Password must be at least 8 characters")),
    confirmPassword: v.pipe(v.string(), v.minLength(8, "Password must be at least 8 characters")),
  }),
  v.forward(
    v.partialCheck(
      [["password"], ["confirmPassword"]],
      (input) => input.password === input.confirmPassword,
      "The two passwords do not match.",
    ),
    ["confirmPassword"],
  ),
);

export function CreateAccountForm() {
  const navigate = useNavigate();
  const form = useForm<v.InferOutput<typeof createAccountSchema>>({
    resolver: valibotResolver(createAccountSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutateAsync: login, isPending } = useMutation({
    mutationFn: async (info: v.InferOutput<typeof createAccountSchema>) => {
      const { error } = await authClient.signUp.email({
        email: info.email,
        password: info.password,
        name: info.username,
        username: info.username,
      });
      if (error) throw new Error(error.message ?? error.statusText ?? "Unknown error");
      await navigate("/");
    },
    onError: (error) => toast.error(error.message),
    onSuccess: () => toast.success("Account created, redirecting..."),
  });

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Create Account</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Create an account to start using Mochiba
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit((data) => login(data))}>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="hello@example.com" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="confirm password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" loading={isPending}>
              Create Account
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="flex w-full flex-col justify-center gap-2 border-t py-2">
          <p className="text-center text-xs text-neutral-500">
            Already have an account?{" "}
            <Link to="/login">
              <span className="underline">Login</span>
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
