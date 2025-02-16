import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const getBaseURL = () =>
  import.meta.env.SSR ? import.meta.env.VITE_PUBLIC_WEBAPP_URL : window.location.origin;

export const authClient = createAuthClient({
  baseURL: `${getBaseURL()}/api/auth`,
  plugins: [usernameClient()],
});

export type AuthSession = typeof authClient.$Infer.Session;
