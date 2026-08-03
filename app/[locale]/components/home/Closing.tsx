"use client";

import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import { revealOnScroll } from "@/shared/motion/revealOnScroll";
import { pressable } from "@/shared/motion/pressable";

interface ClosingProps {
  title: string;
  description: string;
  cta: string;
  footerText: string;
  githubLabel: string;
  githubUrl: string;
  demoHref: string | null;
  demoCta: string;
}

const CLOSING_CTA_CLASS =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-8 text-sm font-semibold text-white transition-colors hover:bg-ink-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-page";

export function Closing({
  title,
  description,
  cta,
  footerText,
  githubLabel,
  githubUrl,
  demoHref,
  demoCta,
}: ClosingProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <>
      <section className="px-6 py-20 sm:px-10 sm:py-28 lg:px-16 lg:py-32">
        <motion.div
          {...revealOnScroll(prefersReducedMotion, { margin: "-100px" })}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="font-display text-4xl font-medium leading-[1.02] tracking-tight text-ink sm:text-5xl">
            {title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-ink-secondary sm:text-lg">
            {description}
          </p>

          <motion.div
            className="mt-10 inline-block"
            {...pressable(prefersReducedMotion)}
          >
            {demoHref ? (
              <a href={demoHref} className={CLOSING_CTA_CLASS}>
                {demoCta}
              </a>
            ) : (
              <Link href="/signup" className={CLOSING_CTA_CLASS}>
                {cta}
              </Link>
            )}
          </motion.div>
        </motion.div>
      </section>

      <footer className="border-t border-border px-6 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-ink-muted sm:flex-row">
          <p>{footerText}</p>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md underline decoration-border-strong underline-offset-4 transition-colors hover:text-ink-secondary hover:decoration-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            {githubLabel}
          </a>
        </div>
      </footer>
    </>
  );
}