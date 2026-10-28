"use client";

import { Link } from "@/i18n/navigation";
import { useRevealOnScroll } from "@/shared/motion/revealOnScroll";
import { buttonVariants } from "@/shared/ui/Button";

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

const CLOSING_CTA_CLASS = buttonVariants("primary", "min-h-12 px-8");

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
  const revealRef = useRevealOnScroll<HTMLDivElement>({ margin: "-100px" });

  return (
    <>
      <section className="px-6 py-20 sm:px-10 sm:py-28 lg:px-16 lg:py-32">
        <div ref={revealRef} className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-display text-ink-primary sm:text-5xl">
            {title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-ink-secondary sm:text-lg">
            {description}
          </p>

          <div className="motion-press mt-10 inline-block">
            {demoHref ? (
              <a href={demoHref} className={CLOSING_CTA_CLASS}>
                {demoCta}
              </a>
            ) : (
              <Link href="/signup" className={CLOSING_CTA_CLASS}>
                {cta}
              </Link>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-ink-muted sm:flex-row">
          <p>{footerText}</p>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center underline decoration-ink-faint underline-offset-4 transition-colors hover:text-ink-secondary hover:decoration-ink-secondary"
          >
            {githubLabel}
          </a>
        </div>
      </footer>
    </>
  );
}