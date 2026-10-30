"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useDisclosure } from "@/shared/hooks/useDisclosure";
import { DisclosureButton } from "@/shared/ui/DisclosureButton";

const CONTENT_CLASS =
  "whitespace-pre-wrap wrap-break-word text-sm text-ink-secondary";
const CLAMPED_CONTENT_CLASS = `${CONTENT_CLASS} line-clamp-3 group-target:line-clamp-none`;

const resizeListeners = new WeakMap<Element, () => void>();
let sharedResizeObserver: ResizeObserver | null = null;

function observeResize(element: Element, listener: () => void): () => void {
  if (typeof ResizeObserver === "undefined") return () => {};

  sharedResizeObserver ??= new ResizeObserver((entries) => {
    for (const entry of entries) resizeListeners.get(entry.target)?.();
  });
  const observer = sharedResizeObserver;
  resizeListeners.set(element, listener);
  observer.observe(element);

  return () => {
    observer.unobserve(element);
    resizeListeners.delete(element);
  };
}

interface NoteContentDisclosureProps {
  content: string;
}

export function NoteContentDisclosure({ content }: NoteContentDisclosureProps) {
  const t = useTranslations("notes.item");
  const disclosure = useDisclosure();
  const { isExpanded } = disclosure;
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [measuredContent, setMeasuredContent] = useState(content);

  if (measuredContent !== content) {
    setMeasuredContent(content);
    disclosure.collapse();
  }

  useEffect(() => {
    const element = contentRef.current;
    if (!element || isExpanded) return;

    let isActive = true;
    const measure = () => {
      if (isActive) setIsOverflowing(element.scrollHeight > element.clientHeight);
    };

    measure();
    void document.fonts?.ready.then(measure);
    const stopObserving = observeResize(element, measure);

    return () => {
      isActive = false;
      stopObserving();
    };
  }, [content, isExpanded]);

  const showToggle = isExpanded || isOverflowing;

  return (
    <div>
      <p
        ref={contentRef}
        id={disclosure.panelId}
        className={isExpanded ? CONTENT_CLASS : CLAMPED_CONTENT_CLASS}
      >
        {content}
      </p>

      {showToggle ? (
        <DisclosureButton disclosure={disclosure}>
          {isExpanded ? t("showLess") : t("showMore")}
        </DisclosureButton>
      ) : null}
    </div>
  );
}
