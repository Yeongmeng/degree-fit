import { createBrowserRouter } from "react-router-dom";
import Landing from "./views/Landing";
import AppShell from "./views/AppShell";
import Privacy from "./views/Privacy";
import Terms from "./views/Terms";

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/app", element: <AppShell /> },
  { path: "/privacy", element: <Privacy /> },
  { path: "/terms", element: <Terms /> },
]);
