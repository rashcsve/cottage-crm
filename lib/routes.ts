export const publicRoutes = {
  home: "/",
  login: "/login",
  signup: "/signup",
} as const;

export const dashboardRoutes = {
  visits: "/visits",
  shopping: "/shopping",
  tasks: "/tasks",
  notes: "/notes",
} as const;

export const dashboardNavigationItems = [
  { key: "visits", href: dashboardRoutes.visits },
  { key: "shopping", href: dashboardRoutes.shopping },
  { key: "tasks", href: dashboardRoutes.tasks },
  { key: "notes", href: dashboardRoutes.notes },
] as const;

export const DEFAULT_AUTHENTICATED_ROUTE = dashboardRoutes.tasks;

export const MAIN_CONTENT_ID = "main-content";

export type PublicRoute = (typeof publicRoutes)[keyof typeof publicRoutes];
