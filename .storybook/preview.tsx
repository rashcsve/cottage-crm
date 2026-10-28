import type { Preview } from "@storybook/nextjs-vite";
import { sb } from "storybook/test";
import { NextIntlClientProvider } from "next-intl";
import messages from "../i18n/locales/en.json";
import "../app/globals.css";

sb.mock("../lib/auth/sign-out.ts");

const preview: Preview = {
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "page",
      values: [
        { name: "page", value: "#F5F6F3" },
        { name: "white", value: "#ffffff" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "error",
    },
  },
};

export default preview;
