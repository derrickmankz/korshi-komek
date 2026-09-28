export const CITIES: { name: string; center: [number, number] }[] = [
  { name: "Астана", center: [51.1694, 71.4491] },
  { name: "Алматы", center: [43.238, 76.889] },
  { name: "Шымкент", center: [42.317, 69.59] },
  { name: "Актау", center: [43.65, 51.16] },
  { name: "Актобе", center: [50.279, 57.207] },
  { name: "Атырау", center: [47.117, 51.883] },
  { name: "Жезказган", center: [47.783, 67.7] },
  { name: "Караганда", center: [49.806, 73.087] },
  { name: "Кокшетау", center: [53.2833, 69.3833] },
  { name: "Конаев", center: [43.8667, 77.0667] },
  { name: "Костанай", center: [53.2144, 63.6246] },
  { name: "Кызылорда", center: [44.8528, 65.5092] },
  { name: "Павлодар", center: [52.285, 76.94] },
  { name: "Петропавловск", center: [54.8728, 69.143] },
  { name: "Семей", center: [50.411, 80.226] },
  { name: "Талдыкорган", center: [45.0167, 78.3667] },
  { name: "Тараз", center: [42.9, 71.367] },
  { name: "Туркестан", center: [43.3, 68.25] },
  { name: "Уральск", center: [51.2333, 51.3667] },
  { name: "Усть-Каменогорск", center: [49.948, 82.628] },
];

export const CUSTOM_CITY_VALUE = "__custom_city__";

export function isKnownCity(cityName: string | null | undefined): boolean {
  return Boolean(cityName && CITIES.some((city) => city.name === cityName));
}

export function cityCenter(cityName: string | null | undefined): [number, number] | null {
  if (!cityName) return null;
  const found = CITIES.find((c) => c.name === cityName);
  return found ? found.center : null;
}
