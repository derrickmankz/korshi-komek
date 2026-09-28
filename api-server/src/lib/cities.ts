export const SUPPORTED_CITIES = [
  { name: "Астана", center: [51.1694, 71.4491] as const },
  { name: "Алматы", center: [43.238, 76.889] as const },
  { name: "Шымкент", center: [42.317, 69.59] as const },
  { name: "Актау", center: [43.65, 51.16] as const },
  { name: "Актобе", center: [50.279, 57.207] as const },
  { name: "Атырау", center: [47.117, 51.883] as const },
  { name: "Жезказган", center: [47.783, 67.7] as const },
  { name: "Караганда", center: [49.806, 73.087] as const },
  { name: "Кокшетау", center: [53.2833, 69.3833] as const },
  { name: "Конаев", center: [43.8667, 77.0667] as const },
  { name: "Костанай", center: [53.2144, 63.6246] as const },
  { name: "Кызылорда", center: [44.8528, 65.5092] as const },
  { name: "Павлодар", center: [52.285, 76.94] as const },
  { name: "Петропавловск", center: [54.8728, 69.143] as const },
  { name: "Семей", center: [50.411, 80.226] as const },
  { name: "Талдыкорган", center: [45.0167, 78.3667] as const },
  { name: "Тараз", center: [42.9, 71.367] as const },
  { name: "Туркестан", center: [43.3, 68.25] as const },
  { name: "Уральск", center: [51.2333, 51.3667] as const },
  { name: "Усть-Каменогорск", center: [49.948, 82.628] as const },
] as const;

export const SUPPORTED_CITY_NAMES = SUPPORTED_CITIES.map((city) => city.name);

export function isSupportedCity(value: string): boolean {
  return SUPPORTED_CITIES.some((city) => city.name === value);
}

export function isValidCityName(value: string): boolean {
  const city = value.trim();
  return city.length >= 2 && city.length <= 100 && /^[\p{L}][\p{L}\s.'-]*$/u.test(city);
}

export function cityCenter(city: string | null | undefined): readonly [number, number] | null {
  return SUPPORTED_CITIES.find((item) => item.name === city)?.center ?? null;
}

export function distanceFromCityCenterMeters(
  city: string | null | undefined,
  latitude: number,
  longitude: number,
): number {
  const center = cityCenter(city);
  if (!center) return 0;

  const earthRadiusMeters = 6_371_000;
  const lat1 = (center[0] * Math.PI) / 180;
  const lat2 = (latitude * Math.PI) / 180;
  const deltaLat = ((latitude - center[0]) * Math.PI) / 180;
  const deltaLon = ((longitude - center[1]) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  return Math.round(earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}