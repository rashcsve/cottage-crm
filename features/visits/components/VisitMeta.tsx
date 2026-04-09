"use client";

import { useTranslations } from "next-intl";
import type { Visit } from "../types/visits";

interface VisitMetaProps {
  visit: Visit;
}

export function VisitMeta({ visit }: VisitMetaProps) {
  const t = useTranslations("visits.meta");

  return (
    <p className="text-xs text-stone-400">
      {t("addedBy")}: {visit.author}
    </p>
  );
}
