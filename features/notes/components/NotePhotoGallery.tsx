"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { NotePhoto } from "@/features/notes/types/notes";

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

  const isMulti = photos.length > 1;
  const isFirst = expandedIndex === 0;
  const isLast = expandedIndex === photos.length - 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (expandedIndex !== null) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [expandedIndex]);

  function closeDialog() {
    setExpandedIndex(null);
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
        aria-label={t("photoGalleryLabel", { count: photos.length })}
        className="mt-2.5 flex flex-wrap gap-1.5"
      >
        {photos.map((photo, index) => {
          const photoUrl = photo.url;
          const isUnavailable = !photoUrl || failedPhotoIdSet.has(photo.id);

          return (
            <li key={photo.id}>
              {isUnavailable ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-stone-200 bg-stone-50 p-1 text-center text-[9px] font-medium leading-tight text-stone-400">
                  {t("photoUnavailable")}
                </div>
              ) : (
                <button
                  type="button"
                  aria-label={t("photoExpand", { index: index + 1 })}
                  onClick={() => setExpandedIndex(index)}
                  className="overflow-hidden rounded-lg border border-stone-200 bg-stone-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 hover:opacity-90"
                >
                  <Image
                    src={photoUrl}
                    alt={t("photoAlt", {
                      author: authorName,
                      index: index + 1,
                    })}
                    width={128}
                    height={128}
                    loading="lazy"
                    className="h-32 w-32 object-cover"
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
        onClose={closeDialog}
        onKeyDown={handleDialogKeyDown}
        aria-label={
          expandedIndex !== null
            ? t("photoAlt", { author: authorName, index: expandedIndex + 1 })
            : undefined
        }
        className="m-auto border-0 bg-transparent p-0 shadow-none outline-none backdrop:bg-stone-900/75 backdrop:backdrop-blur-sm"
      >
        {expandedIndex !== null && photos[expandedIndex]?.url && (
          <div className={isMulti ? "flex items-center gap-3" : undefined}>
            {isMulti &&
              (isFirst ? (
                <div className="h-11 w-11 shrink-0" />
              ) : (
                <button
                  type="button"
                  onClick={goToPrev}
                  aria-label={t("photoPrev")}
                  className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-full bg-stone-900/70 text-white transition hover:bg-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
              ))}

            <div
              className="relative"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <Image
                src={photos[expandedIndex].url!}
                alt={t("photoAlt", {
                  author: authorName,
                  index: expandedIndex + 1,
                })}
                width={1920}
                height={1920}
                className={`block h-auto max-h-[88svh] w-auto rounded-2xl ${isMulti ? "max-w-[calc(88svw-7rem)]" : "max-w-[88svw]"}`}
              />

              <button
                type="button"
                onClick={closeDialog}
                aria-label={t("photoClose")}
                className="absolute right-2.5 top-2.5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-stone-900/70 text-white transition hover:bg-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>

              {isMulti && (
                <div
                  aria-live="polite"
                  aria-atomic="true"
                  className="absolute bottom-2.5 left-1/2 -translate-x-1/2 rounded-full bg-stone-900/70 px-3 py-1 text-xs font-medium tabular-nums text-white"
                >
                  {expandedIndex + 1} / {photos.length}
                </div>
              )}
            </div>

            {isMulti &&
              (isLast ? (
                <div className="h-11 w-11 shrink-0" />
              ) : (
                <button
                  type="button"
                  onClick={goToNext}
                  aria-label={t("photoNext")}
                  className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-full bg-stone-900/70 text-white transition hover:bg-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              ))}
          </div>
        )}
      </dialog>
    </>
  );
}
