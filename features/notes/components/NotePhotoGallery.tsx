"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { NotePhoto } from "@/features/notes/types/notes";

const LIGHTBOX_CONTROL_CLASS =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-control bg-ink-primary text-on-accent transition-colors hover:bg-ink-secondary focus-visible:outline-on-accent";

interface NotePhotoGalleryProps {
  authorName: string;
  photos: NotePhoto[];
}

export function NotePhotoGallery({
  authorName,
  photos,
}: NotePhotoGalleryProps) {
  const t = useTranslations("notes.item");
  const [failedPhotoIds, setFailedPhotoIds] = useState<number[]>([]);
  const failedPhotoIdSet = useMemo(
    () => new Set(failedPhotoIds),
    [failedPhotoIds],
  );
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isMulti = photos.length > 1;
  const isFirst = expandedIndex === 0;
  const isLast = expandedIndex === photos.length - 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (expandedIndex !== null) {
      if (!dialog.open) dialog.showModal();
      else if (!dialog.contains(document.activeElement)) {
        closeButtonRef.current?.focus();
      }
      return;
    }

    if (dialog.open) dialog.close();
  }, [expandedIndex]);

  function photoAlt(index: number) {
    if (!authorName) {
      return t("photoAltUnknown", { index });
    }

    return t("photoAlt", { author: authorName, index });
  }

  function closeDialog() {
    setExpandedIndex(null);
  }

  function handleDialogClose() {
    setExpandedIndex(null);
    const trigger = triggerRef.current;
    if (trigger?.isConnected) trigger.focus();
    else listRef.current?.focus();
    triggerRef.current = null;
  }

  function goToPrev() {
    setExpandedIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  }

  function goToNext() {
    setExpandedIndex((i) =>
      i !== null && i < photos.length - 1 ? i + 1 : i,
    );
  }

  function handleDialogClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) closeDialog();
  }

  function handleDialogKeyDown(
    event: React.KeyboardEvent<HTMLDialogElement>,
  ) {
    if (event.key === "ArrowLeft") goToPrev();
    if (event.key === "ArrowRight") goToNext();
  }

  function handleTouchStart(event: React.TouchEvent) {
    touchStartXRef.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartXRef.current === null) return;
    const delta = touchStartXRef.current - event.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      if (delta > 0) goToNext();
      else goToPrev();
    }
    touchStartXRef.current = null;
  }

  return (
    <>
      <ul
        ref={listRef}
        tabIndex={-1}
        aria-label={t("photoGalleryLabel", { count: photos.length })}
        className="-mx-1 mt-2 -mb-1 flex gap-2 overflow-x-auto p-1"
      >
        {photos.map((photo, index) => {
          const thumbnailUrl = photo.thumbnailUrl;
          const isUnavailable =
            !photo.url || !thumbnailUrl || failedPhotoIdSet.has(photo.id);

          return (
            <li key={photo.id} className="shrink-0">
              {isUnavailable ? (
                <div
                  title={t("photoUnavailable")}
                  className="flex size-16 items-center justify-center rounded-control bg-muted text-ink-muted"
                >
                  <ImageOff className="size-5" aria-hidden="true" />
                  <span className="sr-only">{t("photoUnavailable")}</span>
                </div>
              ) : (
                <button
                  type="button"
                  aria-label={t("photoExpand", { index: index + 1 })}
                  onClick={(event) => {
                    triggerRef.current = event.currentTarget;
                    setExpandedIndex(index);
                  }}
                  className="block overflow-hidden rounded-control bg-muted transition-opacity hover:opacity-90"
                >
                  <Image
                    src={thumbnailUrl}
                    alt={photoAlt(index + 1)}
                    width={128}
                    height={128}
                    unoptimized
                    loading="lazy"
                    className="size-16 object-cover"
                    onError={() => {
                      setFailedPhotoIds((current) =>
                        current.includes(photo.id)
                          ? current
                          : [...current, photo.id],
                      );
                    }}
                  />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialogRef}
        onClick={handleDialogClick}
        onClose={handleDialogClose}
        onKeyDown={handleDialogKeyDown}
        aria-label={
          expandedIndex !== null
            ? photoAlt(expandedIndex + 1)
            : undefined
        }
        className="m-auto border-0 bg-transparent p-0 outline-none backdrop:bg-ink-primary/90"
      >
        {expandedIndex !== null && photos[expandedIndex]?.url && (
          <div className={isMulti ? "flex items-center gap-3" : undefined}>
            {isMulti &&
              (isFirst ? (
                <div className="size-11 shrink-0" />
              ) : (
                <button
                  type="button"
                  onClick={goToPrev}
                  aria-label={t("photoPrev")}
                  className={LIGHTBOX_CONTROL_CLASS}
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
              ))}

            <div
              className="relative"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <Image
                src={photos[expandedIndex].url!}
                alt={photoAlt(expandedIndex + 1)}
                width={1920}
                height={1920}
                unoptimized
                className={`block h-auto max-h-[88svh] w-auto rounded-control ${isMulti ? "max-w-[calc(88svw-7rem)]" : "max-w-[88svw]"}`}
              />

              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeDialog}
                aria-label={t("photoClose")}
                className={`absolute right-2.5 top-2.5 z-10 ${LIGHTBOX_CONTROL_CLASS}`}
              >
                <X className="size-5" aria-hidden="true" />
              </button>

              {isMulti && (
                <div
                  aria-live="polite"
                  aria-atomic="true"
                  className="absolute bottom-2.5 left-1/2 -translate-x-1/2 rounded-control bg-ink-primary px-3 py-1 font-mono text-xs tabular-nums text-on-accent"
                >
                  {expandedIndex + 1} / {photos.length}
                </div>
              )}
            </div>

            {isMulti &&
              (isLast ? (
                <div className="size-11 shrink-0" />
              ) : (
                <button
                  type="button"
                  onClick={goToNext}
                  aria-label={t("photoNext")}
                  className={LIGHTBOX_CONTROL_CLASS}
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
              ))}
          </div>
        )}
      </dialog>
    </>
  );
}
