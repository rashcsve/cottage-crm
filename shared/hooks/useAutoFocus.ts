"use client";

import { useEffect } from "react";

export function useAutoFocus<T extends string>(
  setFocus: (name: T) => void,
  fieldName: T,
): void {
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setFocus(fieldName);
    });

    return () => cancelAnimationFrame(frameId);
  }, [setFocus, fieldName]);
}
