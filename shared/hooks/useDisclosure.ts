"use client";

import { useCallback, useId, useState } from "react";

export interface DisclosureState {
  isExpanded: boolean;
  panelId: string;
  toggle: () => void;
  collapse: () => void;
}

export function useDisclosure(): DisclosureState {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();
  const toggle = useCallback(() => setIsExpanded((expanded) => !expanded), []);
  const collapse = useCallback(() => setIsExpanded(false), []);

  return { isExpanded, panelId, toggle, collapse };
}
