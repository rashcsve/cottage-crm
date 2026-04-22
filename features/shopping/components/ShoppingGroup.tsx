import { ShoppingList } from "@/features/shopping/components/ShoppingList";
import type {
  ShoppingFilter,
  ShoppingItem,
} from "@/features/shopping/types/shopping";
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
  "rounded-3xl border border-stone-200 bg-stone-50/70 p-4 shadow-sm sm:rounded-4xl sm:p-5";
const BASE_TITLE_CLASS = "text-xl font-semibold leading-tight";
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
      <div className="flex flex-col gap-4">
        <header className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            {eyebrow}
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <h3
              id={headingId}
              className={`${BASE_TITLE_CLASS} ${titleToneClass}`}
            >
              {title}
            </h3>

            <StatusBadge tone={tone} className={COUNT_BADGE_CLASS}>
              {items.length}
            </StatusBadge>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-stone-600">
            {description}
          </p>
        </header>

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
