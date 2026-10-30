"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const CONTENT_CLASS =
  "whitespace-pre-wrap wrap-break-word text-sm text-ink-secondary";
const TOGGLE_CLASS =
  "inline-flex min-h-6 cursor-pointer items-center rounded-control text-2xs font-semibold text-ink-secondary hover:text-ink-primary sm:text-xs";

interface NoteContentDisclosureProps {
  content: string;
}

export function NoteContentDisclosure({ content }: NoteContentDisclosureProps) {
  const t = useTranslations("notes.item");
  const contentId = useId();
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [measuredContent, setMeasuredContent] = useState(content);

  if (measuredContent !== content) {
    setMeasuredContent(content);
    setIsExpanded(false);
  }

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const measure = () =>
      setIsOverflowing(element.scrollHeight > element.clientHeight);

    measure();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [content, isExpanded]);

  const showToggle = isExpanded || isOverflowing;

  return (
    <div>
      <p
        ref={contentRef}
        id={contentId}
        className={isExpanded ? CONTENT_CLASS : `${CONTENT_CLASS} line-clamp-3`}
      >
        {content}
      </p>

      {showToggle ? (
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls={contentId}
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className={TOGGLE_CLASS}
        >
          {isExpanded ? t("showLess") : t("showMore")}
        </button>
      ) : null}
    </div>
  );
}
