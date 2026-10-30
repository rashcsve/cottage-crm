"use client";

import { startTransition, useOptimistic } from "react";
import { useRouter } from "@/i18n/navigation";

export type NavigationHref = Parameters<ReturnType<typeof useRouter>["push"]>[0];

interface UseOptimisticNavigationResult<T> {
  value: T;
  navigate: (nextValue: T, href: NavigationHref) => void;
}

export function useOptimisticNavigation<T>(
  serverValue: T,
): UseOptimisticNavigationResult<T> {
  const router = useRouter();
  const [value, setOptimisticValue] = useOptimistic(serverValue);

  function navigate(nextValue: T, href: NavigationHref) {
    startTransition(() => {
      setOptimisticValue(nextValue);
      router.push(href, { scroll: false });
    });
  }

  return { value, navigate };
}
