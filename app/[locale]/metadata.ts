import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface LocaleParams {
  params: Promise<{ locale: string }>;
}

interface PageMetadataOptions {
  titleKey?: string;
  descriptionKey?: string;
}

export function createPageMetadata(
  namespace: string,
  {
    titleKey = "pageTitle",
    descriptionKey = "pageDescription",
  }: PageMetadataOptions = {},
) {
  return async function generateMetadata({
    params,
  }: LocaleParams): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace });

    return {
      title: t(titleKey),
      description: t(descriptionKey),
    };
  };
}
