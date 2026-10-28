"use client";

import type { CSSProperties } from "react";
import { useRevealOnScroll } from "@/shared/motion/revealOnScroll";
import { Eyebrow } from "./Eyebrow";

interface FeatureItem {
  index: string;
  title: string;
  description: string;
}

interface FeaturesProps {
  eyebrow: string;
  title: string;
  items: FeatureItem[];
}

export function Features({ eyebrow, title, items }: FeaturesProps) {
  const headingRef = useRevealOnScroll<HTMLDivElement>();

  return (
    <section className="px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_2fr] lg:gap-16">
          <div ref={headingRef} className="[--motion-y:20px]">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="mt-5 max-w-xs text-3xl font-bold tracking-display text-ink-primary sm:text-4xl">
              {title}
            </h2>
          </div>

          <ul className="divide-y divide-border border-t border-border">
            {items.map((item, index) => (
              <FeatureListItem key={item.index} item={item} delayMs={index * 100} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function FeatureListItem({ item, delayMs }: { item: FeatureItem; delayMs: number }) {
  const ref = useRevealOnScroll<HTMLLIElement>();

  return (
    <li
      ref={ref}
      style={{ "--reveal-delay": `${delayMs}ms` } as CSSProperties}
      className="flex flex-col gap-3 py-8 sm:flex-row sm:items-baseline sm:gap-8"
    >
      <span className="font-mono text-sm text-ink-muted">{item.index}</span>
      <div className="min-w-0">
        <h3 className="text-xl font-semibold tracking-heading text-ink-primary sm:text-2xl">{item.title}</h3>
        <p className="mt-3 max-w-xl text-base leading-7 text-ink-secondary">
          {item.description}
        </p>
      </div>
    </li>
  );
}
