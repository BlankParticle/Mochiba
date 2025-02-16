import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@api/trpc/index";
import SuperJSON from "superjson";
import { toast } from "sonner";

export const trpc = createTRPCReact<AppRouter>();
export const client = trpc.createClient({
  links: [
    loggerLink({ enabled: () => true }),
    httpBatchLink({ url: "/api/trpc", transformer: SuperJSON }),
  ],
});

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (err, { meta }) => {
      if (meta && meta.noGlobalError === true) return;
      toast.error(err.message);
    },
  }),
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (err) => toast.error(err.message),
    },
  },
});

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
