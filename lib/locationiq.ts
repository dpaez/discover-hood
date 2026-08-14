import { cacheLife } from "next/cache";

import type {
  LocationIQAutocomplete,
  LocationIQReverseResponse,
  NearbyResponse,
} from "@/app/types";

function getAccessToken() {
  return process.env.GEOLOCATIONIQ_ACCESS_TOKEN;
}

/** Round coords so tiny float noise shares a cache entry. */
export function roundCoord(value: string | number, decimals = 5): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return String(value).trim();
  return n.toFixed(decimals);
}

export async function reverseGeocode(
  lat: string,
  lon: string,
): Promise<LocationIQReverseResponse | null> {
  "use cache";
  cacheLife("days");

  const key = getAccessToken();
  if (!key) return null;

  const normalizedLat = roundCoord(lat);
  const normalizedLon = roundCoord(lon);

  const res = await fetch(
    `https://api.locationiq.com/v1/reverse?key=${key}&lat=${normalizedLat}&lon=${normalizedLon}&format=json`,
    { next: { revalidate: 86400 } },
  );

  if (!res.ok) return null;
  const data = await res.json();

  return {
    place_id: data.place_id as string,
    display_name: data.display_name as string,
    address: data.address ?? {},
  };
}

export async function autocomplete(
  query: string,
): Promise<LocationIQAutocomplete[] | { error: string }> {
  const key = getAccessToken();
  if (!key) return { error: "Access token is required" };

  const q = query.trim();
  const res = await fetch(
    `https://api.locationiq.com/v1/autocomplete?key=${key}&q=${encodeURIComponent(q)}`,
    { next: { revalidate: 300 } },
  );

  const data = await res.json();
  if (!res.ok) {
    return {
      error:
        typeof data?.error === "string" ? data.error : "Autocomplete failed",
    };
  }

  return Array.isArray(data) ? (data as LocationIQAutocomplete[]) : [];
}

export async function nearby(
  lat: string | number,
  lon: string | number,
  radius: number,
): Promise<NearbyResponse[] | { error: string; status: number }> {
  const key = getAccessToken();
  if (!key) return { error: "Access token is required", status: 400 };

  const normalizedLat = roundCoord(lat);
  const normalizedLon = roundCoord(lon);

  const res = await fetch(
    `https://us1.locationiq.com/v1/nearby?key=${key}&lat=${normalizedLat}&lon=${normalizedLon}&tag=all&radius=${radius}&format=json&limit=50&dedupe=1`,
    { next: { revalidate: 3600 } },
  );

  if (res.status === 404) {
    return [];
  }

  const data = await res.json();
  if (!res.ok) {
    return {
      error:
        typeof data?.error === "string" ? data.error : "Nearby lookup failed",
      status: res.status,
    };
  }

  return Array.isArray(data) ? (data as NearbyResponse[]) : [];
}

export const CACHE_CONTROL = {
  latlon: "public, s-maxage=60, stale-while-revalidate=300",
  reverse: "public, s-maxage=86400, stale-while-revalidate=604800",
  scores: "public, s-maxage=3600, stale-while-revalidate=86400",
} as const;
