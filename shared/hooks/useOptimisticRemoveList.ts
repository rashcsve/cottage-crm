"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TOAST_UNDO_WINDOW_MS } from "@/shared/Toast/constants";
import { useToast } from "@/shared/Toast/useToast";

type OptimisticRemoveResult = {
  ok: boolean;
  error?: string;
};

type PendingRemoval = {
  timerId: number;
  toastId: string;
};

interface UseOptimisticRemoveListOptions<TItem extends { id: TId }, TId> {
  items: TItem[];
  commitRemove: (item: TItem) => Promise<OptimisticRemoveResult>;
  messages: {
    success: string;
    restored: string;
    undo: string;
    fallbackError: string;
    retry?: string;
  };
  onCommitSuccess?: (item: TItem) => void | Promise<void>;
  undoWindowMs?: number;
}

interface UseOptimisticRemoveListResult<TItem> {
  items: TItem[];
  removeItem: (item: TItem) => void;
}

export function useOptimisticRemoveList<
  TItem extends { id: TId },
  TId extends string | number,
>({
  items,
  commitRemove,
  messages,
  onCommitSuccess,
  undoWindowMs = TOAST_UNDO_WINDOW_MS,
}: UseOptimisticRemoveListOptions<TItem, TId>): UseOptimisticRemoveListResult<TItem> {
  const { showToast, dismissToast, info, error } = useToast();
  const [removedIds, setRemovedIds] = useState<Set<TId>>(() => new Set());
  const pendingRemovalsRef = useRef<Map<TId, PendingRemoval>>(new Map());
  const removeItemRef = useRef<(item: TItem) => void>(() => {});

  const clearPendingRemoval = useCallback((id: TId) => {
    const pendingRemoval = pendingRemovalsRef.current.get(id);

    if (!pendingRemoval) {
      return;
    }

    window.clearTimeout(pendingRemoval.timerId);
    pendingRemovalsRef.current.delete(id);
  }, []);

  const dismissPendingRemoval = useCallback(
    (id: TId) => {
      const pendingRemoval = pendingRemovalsRef.current.get(id);

      if (!pendingRemoval) {
        return;
      }

      window.clearTimeout(pendingRemoval.timerId);
      dismissToast(pendingRemoval.toastId);
      pendingRemovalsRef.current.delete(id);
    },
    [dismissToast]
  );

  const hideItem = useCallback((id: TId) => {
    setRemovedIds((prev) => {
      if (prev.has(id)) {
        return prev;
      }

      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const restoreItem = useCallback((id: TId) => {
    setRemovedIds((prev) => {
      if (!prev.has(id)) {
        return prev;
      }

      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  useEffect(() => {
    const itemIds = new Set(items.map((item) => item.id));

    setRemovedIds((prev) => {
      let changed = false;
      const next = new Set(prev);

      for (const id of prev) {
        if (!itemIds.has(id) && !pendingRemovalsRef.current.has(id)) {
          next.delete(id);
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [items]);

  useEffect(() => {
    const pendingRemovals = pendingRemovalsRef.current;

    return () => {
      pendingRemovals.forEach(({ timerId, toastId }) => {
        window.clearTimeout(timerId);
        dismissToast(toastId);
      });
      pendingRemovals.clear();
    };
  }, [dismissToast]);

  const commitPendingRemoval = useCallback(
    async (item: TItem, toastId: string) => {
      const retryAction = messages.retry
        ? { label: messages.retry, onClick: () => removeItemRef.current(item) }
        : undefined;

      try {
        const result = await commitRemove(item);

        dismissToast(toastId);

        if (!result.ok) {
          restoreItem(item.id);
          error(result.error || messages.fallbackError, retryAction ? { action: retryAction } : undefined);
          return;
        }

        await onCommitSuccess?.(item);
      } catch (err) {
        dismissToast(toastId);
        restoreItem(item.id);

        const message =
          err instanceof Error ? err.message : messages.fallbackError;

        error(message, retryAction ? { action: retryAction } : undefined);
      } finally {
        clearPendingRemoval(item.id);
      }
    },
    [
      clearPendingRemoval,
      commitRemove,
      dismissToast,
      error,
      messages.fallbackError,
      messages.retry,
      onCommitSuccess,
      restoreItem,
    ]
  );

  const removeItem = useCallback(
    (item: TItem) => {
      if (pendingRemovalsRef.current.has(item.id)) {
        return;
      }

      hideItem(item.id);

      let toastId = "";

      const handleUndo = () => {
        dismissPendingRemoval(item.id);
        restoreItem(item.id);
        info(messages.restored);
      };

      toastId = showToast(messages.success, {
        type: "info",
        duration: undoWindowMs,
        action: { label: messages.undo, onClick: handleUndo },
      });

      const timerId = window.setTimeout(() => {
        void commitPendingRemoval(item, toastId);
      }, undoWindowMs);

      pendingRemovalsRef.current.set(item.id, { timerId, toastId });
    },
    [
      commitPendingRemoval,
      dismissPendingRemoval,
      hideItem,
      info,
      messages.restored,
      messages.success,
      messages.undo,
      restoreItem,
      showToast,
      undoWindowMs,
    ]
  );

  removeItemRef.current = removeItem;

  const visibleItems = useMemo(
    () => items.filter((item) => !removedIds.has(item.id)),
    [items, removedIds]
  );

  return {
    items: visibleItems,
    removeItem,
  };
}
