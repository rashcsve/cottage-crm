const KNOWN_WEATHER_CONDITION_KEYS = [
  "clear",
  "cloudy",
  "fog",
  "drizzle",
  "rain",
  "snow",
  "storm",
] as const;

export type KnownWeatherConditionKey =
  (typeof KNOWN_WEATHER_CONDITION_KEYS)[number];

export type WeatherConditionKey = KnownWeatherConditionKey | "unknown";

export const WEATHER_CONDITION_KEYS = [
  ...KNOWN_WEATHER_CONDITION_KEYS,
  "unknown",
] as const satisfies readonly WeatherConditionKey[];

const WEATHER_CODE_GROUPS: Record<KnownWeatherConditionKey, readonly number[]> =
  {
    clear: [0],
    cloudy: [1, 2, 3],
    fog: [45, 48],
    drizzle: [51, 53, 55, 56, 57],
    rain: [61, 63, 65, 66, 67, 80, 81, 82],
    snow: [71, 73, 75, 77, 85, 86],
    storm: [95, 96, 99],
  };

const WEATHER_CODE_TO_CONDITION = Object.freeze(
  Object.fromEntries(
    Object.entries(WEATHER_CODE_GROUPS).flatMap(([condition, codes]) =>
      codes.map((code) => [code, condition])
    )
  ) as Record<number, KnownWeatherConditionKey>
);

export function getWeatherConditionKey(
  weatherCode: number
): WeatherConditionKey {
  return WEATHER_CODE_TO_CONDITION[weatherCode] ?? "unknown";
}
