export const publicRoutes = {
  home: "/",
  login: "/login",
  signup: "/signup",
} as const;

export const dashboardRoutes = {
  overview: "/overview",
  visits: "/visits",
  shopping: "/shopping",
  tasks: "/tasks",
  notes: "/notes",
} as const;

export const dashboardNavigationItems = [
  { key: "overview", href: dashboardRoutes.overview },
  { key: "visits", href: dashboardRoutes.visits },
  { key: "shopping", href: dashboardRoutes.shopping },
  { key: "tasks", href: dashboardRoutes.tasks },
  { key: "notes", href: dashboardRoutes.notes },
] as const;

export const DEFAULT_AUTHENTICATED_ROUTE = dashboardRoutes.overview;

export const MAIN_CONTENT_ID = "main-content";

export type PublicRoute = (typeof publicRoutes)[keyof typeof publicRoutes];
