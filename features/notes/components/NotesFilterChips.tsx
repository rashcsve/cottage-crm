import { useTranslations } from "next-intl";
import type { NotesShowFilter } from "@/features/notes/types/notes";
import { Link } from "@/i18n/navigation";

interface NotesFilterChipsProps {
  activeShow: NotesShowFilter;
}

const SHOW_FILTERS: NotesShowFilter[] = ["all", "photos", "mine"];

const CHIP_BASE_CLASS =
  "flex min-h-11 items-center rounded-full border px-3.5 text-xs transition-colors sm:px-4 sm:text-sm";
const CHIP_ACTIVE_CLASS = "border-accent bg-accent font-semibold text-on-accent";
const CHIP_INACTIVE_CLASS =
  "border-border bg-surface font-medium text-ink-secondary hover:text-ink-primary";

function getShowHref(show: NotesShowFilter) {
  if (show === "all") {
    return { pathname: "/notes" } as const;
  }

  return { pathname: "/notes", query: { show } } as const;
}

export function NotesFilterChips({ activeShow }: NotesFilterChipsProps) {
  const t = useTranslations("notes");

  return (
    <nav aria-label={t("showFilter.ariaLabel")}>
      <ul className="flex flex-wrap gap-2">
        {SHOW_FILTERS.map((show) => {
          const isActive = activeShow === show;

          return (
            <li key={show}>
              <Link
                href={getShowHref(show)}
                aria-current={isActive ? "page" : undefined}
                className={`${CHIP_BASE_CLASS} ${isActive ? CHIP_ACTIVE_CLASS : CHIP_INACTIVE_CLASS}`}
              >
                {t(`showFilter.${show}`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
