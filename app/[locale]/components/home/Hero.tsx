"use client";

import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import { buttonVariants } from "@/shared/ui/Button";
import { useSplitLinesReveal } from "@/shared/hooks/useSplitLinesReveal";
import { fadeIn } from "@/shared/motion/fadeIn";
import { pressable } from "@/shared/motion/pressable";
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
  const prefersReducedMotion = usePrefersReducedMotion();
  const press = pressable(prefersReducedMotion);
  const titleRef = useSplitLinesReveal<HTMLHeadingElement>();

  return (
    <section className="relative px-6 pb-12 pt-10 sm:px-10 sm:pb-16 sm:pt-16 lg:px-16 lg:pb-20 lg:pt-20">
      <div className="mx-auto max-w-5xl">
        <motion.div {...fadeIn(prefersReducedMotion)}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </motion.div>

        <h1
          ref={titleRef}
          className="mt-6 max-w-3xl text-display font-bold tracking-display text-ink-primary [--text-display:2.75rem] sm:[--text-display:3.75rem] lg:[--text-display:5rem]"
        >
          {title}
        </h1>

        <motion.p
          {...fadeIn(prefersReducedMotion, { delay: 0.16 })}
          className="mt-8 max-w-xl text-base leading-7 text-ink-secondary sm:text-lg sm:leading-8"
        >
          {description}
        </motion.p>

        <motion.div
          {...fadeIn(prefersReducedMotion, { delay: 0.24 })}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <motion.div {...press}>
            {demoHref ? (
              <a href={demoHref} className={PRIMARY_CTA_CLASS}>
                {primaryCta}
              </a>
            ) : (
              <Link href="/signup" className={PRIMARY_CTA_CLASS}>
                {primaryCta}
              </Link>
            )}
          </motion.div>

          <motion.a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            {...press}
            className={buttonVariants("secondary", "min-h-12 px-6")}
          >
            {secondaryCta}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}