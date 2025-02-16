import { Outlet, redirect } from "react-router";

export function clientLoader() {
  throw redirect("/inbox");
}

export default function App() {
  return <div>Loading...</div>;
}
