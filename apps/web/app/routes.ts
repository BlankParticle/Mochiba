import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("/login", "routes/(auth)/login.tsx"),
  route("/create-account", "routes/(auth)/create-account.tsx"),
  route(":inbox", "routes/inbox/index.tsx", [route(":id?", "routes/inbox/email.tsx")]),
] satisfies RouteConfig;
