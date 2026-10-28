"use client";

import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/shared/ui/Button";
import { Eyebrow } from "./Eyebrow";

interface HeroProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  githubUrl: string;
  demoHref: string | null;
}

const PRIMARY_CTA_CLASS = buttonVariants("primary", "min-h-12 px-8");

export function Hero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  githubUrl,
  demoHref,
}: HeroProps) {
  return (
    <section className="relative px-6 pb-12 pt-10 sm:px-10 sm:pb-16 sm:pt-16 lg:px-16 lg:pb-20 lg:pt-20">
      <div className="mx-auto max-w-5xl">
        <div className="motion-fade-in">
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>

        <h1
          className="mt-6 max-w-3xl text-display font-bold tracking-display text-ink-primary [--text-display:2.75rem] sm:[--text-display:3.75rem] lg:[--text-display:5rem]"
        >
          {title}
        </h1>

        <p
          style={{ animationDelay: "160ms" }}
          className="motion-fade-in mt-8 max-w-xl text-base leading-7 text-ink-secondary sm:text-lg sm:leading-8"
        >
          {description}
        </p>

        <div
          style={{ animationDelay: "240ms" }}
          className="motion-fade-in mt-10 flex flex-wrap items-center gap-4"
        >
          <div className="motion-press">
            {demoHref ? (
              <a href={demoHref} className={PRIMARY_CTA_CLASS}>
                {primaryCta}
              </a>
            ) : (
              <Link href="/signup" className={PRIMARY_CTA_CLASS}>
                {primaryCta}
              </Link>
            )}
          </div>

          <div className="motion-press">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants("secondary", "min-h-12 px-6")}
            >
              {secondaryCta}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
