import type { Note } from "@/features/notes/types/notes";
import type { ShoppingItem } from "@/features/shopping/types/shopping";
import type { Task } from "@/features/tasks/types/tasks";
import type { Visit } from "@/features/visits/types/visits";

export type DashboardWeather =
  | {
      status: "available";
      apparentTemperatureC: number;
      observedAt: string;
      precipitationMm: number;
      temperatureC: number;
      weatherCode: number;
      windSpeedKmh: number;
    }
  | {
      status: "unavailable";
    };

export interface DashboardVisitOverview {
  currentVisits: Visit[];
  nextVisit: Visit | null;
  currentCount: number;
  upcomingCount: number;
}

export interface DashboardTaskOverview {
  openCount: number;
  overdueCount: number;
  dueTodayCount: number;
  priorityTasks: Task[];
}

export interface DashboardShoppingOverview {
  pendingCount: number;
  purchasedCount: number;
  pendingItems: ShoppingItem[];
}

export interface DashboardNotesOverview {
  recentNotes: Note[];
}

export interface DashboardOverviewData {
  todayIso: string;
  visits: DashboardVisitOverview;
  tasks: DashboardTaskOverview;
  shopping: DashboardShoppingOverview;
  notes: DashboardNotesOverview;
}
