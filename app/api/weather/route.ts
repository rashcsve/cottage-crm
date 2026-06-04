import { NextResponse } from "next/server";

import { getCurrentCottageWeather } from "@/features/dashboard/server/weather";

export async function GET() {
  const weather = await getCurrentCottageWeather();

  return NextResponse.json(weather, {
    headers: {
      "Cache-Control":
        weather.status === "available"
          ? "public, s-maxage=900, stale-while-revalidate=60"
          : "no-store",
    },
  });
}
