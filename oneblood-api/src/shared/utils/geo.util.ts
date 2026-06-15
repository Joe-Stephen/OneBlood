export const metersToKm = (meters: number): number =>
  Math.round((meters / 1000) * 10) / 10;

export const kmToMeters = (km: number): number => km * 1000;

export const buildMapsLink = (lat: number, lon: number): string =>
  `https://maps.google.com/?q=${lat},${lon}`;
