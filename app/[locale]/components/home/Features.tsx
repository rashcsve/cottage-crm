"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import { revealOnScroll } from "@/shared/motion/revealOnScroll";
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
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section className="px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_2fr] lg:gap-16">
          <motion.div {...revealOnScroll(prefersReducedMotion, { y: 20 })}>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="mt-5 max-w-xs font-display text-3xl font-medium leading-[1.05] tracking-tight text-ink sm:text-4xl">
              {title}
            </h2>
          </motion.div>

          <ul className="divide-y divide-border border-t border-border">
            {items.map((item, index) => (
              <motion.li
                key={item.index}
                {...revealOnScroll(prefersReducedMotion, { delay: index * 0.1 })}
                className="flex flex-col gap-3 py-8 sm:flex-row sm:items-baseline sm:gap-8"
              >
                <span className="font-mono text-sm text-ink-faint">{item.index}</span>
                <div className="min-w-0">
                  <h3 className="text-xl font-medium text-ink sm:text-2xl">{item.title}</h3>
                  <p className="mt-3 max-w-xl text-base leading-7 text-ink-secondary">
                    {item.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}