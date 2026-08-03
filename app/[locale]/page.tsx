import { getLocale, getTranslations } from "next-intl/server";

import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-authenticated";
import { getDemoCtaHref } from "@/lib/demo/demo-session-url";
import { createPageMetadata } from "./metadata";
import { spaceGrotesk } from "./fonts";
import { Header } from "./components/home/Header";
import { Hero } from "./components/home/Hero";
import { Features } from "./components/home/Features";
import { PinnedTour } from "./components/home/PinnedTour";
import { Closing } from "./components/home/Closing";

const GITHUB_URL = "https://github.com/rashcsve/cottage-crm";

const FEATURE_KEYS = ["visits", "shopping", "tasks"] as const;
const TOUR_KEYS = ["presence", "calendar", "shopping", "tasks"] as const;

export const generateMetadata = createPageMetadata("home", {
  titleKey: "metaTitle",
  descriptionKey: "metaDescription",
});

export default async function HomePage() {
  await redirectIfAuthenticated({ skipDemoAutoLogin: true });
  const [t, tDemo, locale] = await Promise.all([
    getTranslations("home"),
    getTranslations("demo"),
    getLocale(),
  ]);
  const demoHref = getDemoCtaHref(locale);

  const featureItems = FEATURE_KEYS.map((key, index) => ({
    index: String(index + 1).padStart(2, "0"),
    title: t(`features.items.${key}.title`),
    description: t(`features.items.${key}.description`),
  }));

  const tourSteps = TOUR_KEYS.map((key) => ({
    key,
    title: t(`tour.steps.${key}.title`),
    caption: t(`tour.steps.${key}.caption`),
  }));

  return (
    <div
      className={`${spaceGrotesk.variable} min-h-screen bg-page font-sans text-ink`}
    >
      <Header demoHref={demoHref} />
      <Hero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
        primaryCta={t("hero.primaryCta")}
        secondaryCta={t("hero.secondaryCta")}
        githubUrl={GITHUB_URL}
        demoHref={demoHref}
      />
      <Features
        eyebrow={t("features.eyebrow")}
        title={t("features.title")}
        items={featureItems}
      />
      <PinnedTour
        eyebrow={t("tour.eyebrow")}
        title={t("tour.title")}
        steps={tourSteps}
      />
      <Closing
        title={t("closing.title")}
        description={t("closing.description")}
        cta={t("closing.cta")}
        footerText={t("footer.text")}
        githubLabel={t("footer.githubLabel")}
        githubUrl={GITHUB_URL}
        demoHref={demoHref}
        demoCta={tDemo("tryButton")}
      />
    </div>
  );
}