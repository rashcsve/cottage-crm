import { ShoppingList } from "@/features/shopping/components/ShoppingList";
import type {
  ShoppingFilter,
  ShoppingItem,
} from "@/features/shopping/types/shopping";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import type { StatusBadgeTone } from "@/shared/ui/StatusBadge";

interface ShoppingGroupProps {
  eyebrow: string;
  title: string;
  description: string;
  headingId: string;
  items: ShoppingItem[];
  canManageItems: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  tone?: StatusBadgeTone;
  view: ShoppingFilter;
}

const PANEL_BASE_CLASS =
  "rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5 shadow-sm sm:rounded-3xl sm:p-4";
const BASE_TITLE_CLASS = "text-lg font-semibold leading-tight";
const NEUTRAL_TITLE_CLASS = "text-stone-900";
const SUCCESS_TITLE_CLASS = "text-emerald-900";
const COUNT_BADGE_CLASS = "tabular-nums";
const SUCCESS_PANEL_CLASS = "border-emerald-200 bg-emerald-50/60";

export function ShoppingGroup({
  eyebrow,
  title,
  description,
  headingId,
  items,
  canManageItems,
  emptyTitle,
  emptyDescription,
  tone = "neutral",
  view,
}: ShoppingGroupProps) {
  const titleToneClass =
    tone === "success" ? SUCCESS_TITLE_CLASS : NEUTRAL_TITLE_CLASS;
  const panelToneClass = tone === "success" ? SUCCESS_PANEL_CLASS : "";

  return (
    <section
      className={`${PANEL_BASE_CLASS} ${panelToneClass}`.trim()}
      aria-labelledby={headingId}
    >
      <div className="flex flex-col gap-3">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          titleId={headingId}
          titleTag="h3"
          titleClassName={`${BASE_TITLE_CLASS} ${titleToneClass}`}
          description={description}
          badge={
            <StatusBadge tone={tone} className={COUNT_BADGE_CLASS}>
              {items.length}
            </StatusBadge>
          }
          contentClassName="space-y-1.5"
        />

        <ShoppingList
          items={items}
          canManageItems={canManageItems}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          variant="plain"
          view={view}
        />
      </div>
    </section>
  );
}
