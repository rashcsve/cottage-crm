"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import { useSplitLinesReveal } from "@/shared/hooks/useSplitLinesReveal";
import { GSAP_EASE_NAME } from "@/shared/motion/gsapEase";
import { Eyebrow } from "./Eyebrow";
import { Mockup } from "./Mockup";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface TourStep {
  key: string;
  title: string;
  caption: string;
}

interface PinnedTourProps {
  eyebrow: string;
  title: string;
  steps: TourStep[];
}

export function PinnedTour({ eyebrow, title, steps }: PinnedTourProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useSplitLinesReveal<HTMLHeadingElement>();

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const stepEls = gsap.utils.toArray<HTMLElement>(".tour-step");

      stepEls.forEach((step) => {
        const mockupEl = step.querySelector<HTMLElement>(".tour-step-mockup");
        const captionEl = step.querySelector<HTMLElement>(".tour-step-caption");
        const contentPane = step.querySelector<HTMLElement>(".tour-mockup-content");
        const rows = contentPane?.firstElementChild
          ? Array.from(contentPane.firstElementChild.children)
          : [];

        gsap
          .timeline({
            scrollTrigger: {
              trigger: step,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          })
          .from(mockupEl, {
            opacity: 0,
            y: 28,
            duration: 0.7,
            ease: GSAP_EASE_NAME,
          })
          .from(
            rows,
            {
              opacity: 0,
              y: 14,
              duration: 0.45,
              ease: GSAP_EASE_NAME,
              stagger: 0.08,
            },
            "-=0.35"
          )
          .from(
            captionEl,
            { opacity: 0, y: 20, duration: 0.6, ease: GSAP_EASE_NAME },
            "<0.1"
          );
      });
    },
    { scope: containerRef, dependencies: [prefersReducedMotion, steps.length] }
  );

  return (
    <section className="px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2
          ref={titleRef}
          className="mt-5 max-w-md font-display text-3xl font-medium leading-[1.05] tracking-tight text-ink sm:text-4xl"
        >
          {title}
        </h2>

        <div ref={containerRef} className="mt-16 space-y-16">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className="tour-step grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16"
            >
              <div className="tour-step-mockup">
                <Mockup activeStep={index} />
              </div>
              <div className="tour-step-caption">
                <h3 className="text-xl font-medium text-ink sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-md text-base leading-7 text-ink-secondary">
                  {step.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
