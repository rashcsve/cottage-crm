import { TaskData, TaskFilter } from "../types/task.types";

// TODO use i18n && add type guard
export function getListConfig(activeFilter: TaskFilter, data: TaskData) {
  if (activeFilter === "pending") {
    return {
      eyebrow: "Práce kolem chaty",
      title: "Otevřené úkoly",
      description: "To hlavní, co je potřeba udělat teď.",
      count: data.pendingCount,
      tasks: data.pendingTasks,
      emptyTitle: "Žádné otevřené úkoly",
      emptyDescription:
        "Všechno důležité je hotové. Klidně přidej další práci.",
    };
  }

  if (activeFilter === "overdue") {
    return {
      eyebrow: "Priorita",
      title: "Po termínu",
      description:
        "Úkoly, které už jsou po datu. Pomůže je rychle uzavřít nebo přeplánovat.",
      count: data.overdueCount,
      tasks: data.overdueTasks,
      emptyTitle: "Zatím nic po termínu",
      emptyDescription: "Skvělé! Kdykoli se něco opozdí, objeví se tu.",
    };
  }

  return {
    eyebrow: "Historie",
    title: "Dokončené úkoly",
    description: "Naposledy dokončené úkoly.",
    count: data.recentDoneTasks.length,
    tasks: data.recentDoneTasks,
    emptyTitle: "Zatím nic dokončeného",
    emptyDescription: "Až se něco uzavře, objeví se to tady.",
  };
}
