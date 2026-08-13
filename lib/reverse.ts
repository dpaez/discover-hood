import { LocationIQReverseResponse } from "@/app/types";

export async function reverseGeocode(lat: string, lon: string): Promise<LocationIQReverseResponse | null> {
  const key = process.env.GEOLOCATIONIQ_ACCESS_TOKEN;
  if (!key) return null;

  const res = await fetch(
    `https://api.locationiq.com/v1/reverse?key=${key}&lat=${lat}&lon=${lon}&format=json`,
    { next: { revalidate: 86400 } } // optional cache for shared links
  );

  if (!res.ok) return null;
  const data = await res.json();
  
  return {
    place_id: data.place_id as string,
    display_name: data.display_name as string,
    address: data.address ?? {},
  };
}