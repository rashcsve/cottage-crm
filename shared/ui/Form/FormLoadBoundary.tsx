"use client";

import { Component, Suspense, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { RotateCw } from "lucide-react";

import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";

interface FormLoadBoundaryProps {
  message: string;
  reloadLabel: string;
  loadingLabel: string;
  onReload?: () => void;
  children: ReactNode;
}

interface FormLoadBoundaryState {
  error: unknown;
}

const CHUNK_LOAD_ERROR_PATTERN =
  /ChunkLoadError|Loading (CSS )?chunk|Failed to load chunk|dynamically imported module|Importing a module script failed/i;

function isChunkLoadError(error: unknown) {
  return (
    error instanceof Error &&
    CHUNK_LOAD_ERROR_PATTERN.test(`${error.name} ${error.message}`)
  );
}

function reloadPage() {
  window.location.reload();
}

function FocusFirstButton({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    containerRef.current
      ?.querySelector("button")
      ?.focus({ preventScroll: true });
  }, []);

  return <div ref={containerRef}>{children}</div>;
}

export class FormLoadBoundary extends Component<
  FormLoadBoundaryProps,
  FormLoadBoundaryState
> {
  state: FormLoadBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): FormLoadBoundaryState {
    return { error };
  }

  render() {
    const {
      message,
      reloadLabel,
      loadingLabel,
      onReload = reloadPage,
      children,
    } = this.props;

    const { error } = this.state;

    if (error && !isChunkLoadError(error)) {
      throw error;
    }

    if (!error) {
      return (
        <Suspense
          fallback={
            <p role="status" className="text-sm text-ink-secondary">
              {loadingLabel}
            </p>
          }
        >
          {children}
        </Suspense>
      );
    }

    return (
      <FocusFirstButton>
        <FormMessage type="error" message={message} />
        <Button
          type="button"
          variant="secondary"
          onClick={onReload}
          className="mt-4"
        >
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          <span>{reloadLabel}</span>
        </Button>
      </FocusFirstButton>
    );
  }
}
