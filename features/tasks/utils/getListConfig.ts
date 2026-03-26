import { getTranslations } from "next-intl/server";
import type { TaskData, TaskFilter } from "../types/task.types";

export interface ListConfig {
  eyebrow: string;
  title: string;
  description: string;
  count: number;
  tasks: TaskData["pendingTasks"];
  emptyTitle: string;
  emptyDescription: string;
}

interface SectionDataSelector {
  getCount: (data: TaskData) => number;
  getTasks: (data: TaskData) => TaskData["pendingTasks"];
}

const SECTION_DATA_SELECTORS: Record<TaskFilter, SectionDataSelector> = {
  pending: {
    getCount: (data) => data.pendingCount,
    getTasks: (data) => data.pendingTasks,
  },
  overdue: {
    getCount: (data) => data.overdueCount,
    getTasks: (data) => data.overdueTasks,
  },
  done: {
    getCount: (data) => data.doneCount,
    getTasks: (data) => data.doneTasks,
  },
};

export async function getListConfig(
  activeFilter: TaskFilter,
  data: TaskData
): Promise<ListConfig> {
  const t = await getTranslations("tasks.sections");
  const { getCount, getTasks } = SECTION_DATA_SELECTORS[activeFilter];
  const sectionKey = activeFilter;

  return {
    eyebrow: t(`${sectionKey}.eyebrow`),
    title: t(`${sectionKey}.title`),
    description: t(`${sectionKey}.description`),
    count: getCount(data),
    tasks: getTasks(data),
    emptyTitle: t(`${sectionKey}.emptyTitle`),
    emptyDescription: t(`${sectionKey}.emptyDescription`),
  };
}
