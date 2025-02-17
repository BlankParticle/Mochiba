import { Navbar } from "@web/components/blocks/navbar";
import { Outlet, useLoaderData } from "react-router";
import { authClient } from "@web/lib/auth-client";
import type { Route } from "./+types/email";
import { queryClient } from "@web/lib/trpc";
import { EmailList } from "./email-list";
import { AppSidebar } from "./sidebar";

export async function clientLoader() {
  const session = await queryClient.fetchQuery({
    queryFn: () => authClient.getSession().then(({ data }) => data),
    queryKey: ["user-session"],
    staleTime: 15 * 60 * 1000,
  });
  return { session };
}

export default function Home({ params: { inbox, id } }: Route.ClientLoaderArgs) {
  const { session } = useLoaderData<typeof clientLoader>();
  return (
    <>
      <Navbar session={session} />
      <main className="flex flex-1">
        <AppSidebar active={inbox} />
        <EmailList id={id ?? null} />
        <Outlet />
      </main>
    </>
  );
}
