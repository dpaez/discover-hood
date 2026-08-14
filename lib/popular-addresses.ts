export type PopularAddress = {
  display_name: string;
  lat: string;
  lon: string;
};

export const POPULAR_ADDRESSES: PopularAddress[] = [
  {
    display_name: "Empire State Building, New York, NY",
    lat: "40.74844",
    lon: "-73.98566",
  },
  {
    display_name: "Union Square, San Francisco, CA",
    lat: "37.78794",
    lon: "-122.40752",
  },
  {
    display_name: "Millennium Park, Chicago, IL",
    lat: "41.88265",
    lon: "-87.62259",
  },
  {
    display_name: "Pike Place Market, Seattle, WA",
    lat: "47.60972",
    lon: "-122.34248",
  },
  {
    display_name: "Congress Avenue, Austin, TX",
    lat: "30.26715",
    lon: "-97.74306",
  },
  {
    display_name: "French Quarter, New Orleans, LA",
    lat: "29.95106",
    lon: "-90.07153",
  },
  {
    display_name: "Downtown Denver, Denver, CO",
    lat: "39.73923",
    lon: "-104.99025",
  },
  {
    display_name: "Pearl District, Portland, OR",
    lat: "45.51223",
    lon: "-122.67621",
  },
  {
    display_name: "Capitol Hill, Washington, DC",
    lat: "38.89064",
    lon: "-77.03653",
  },
  {
    display_name: "Obelisco, Buenos Aires, Argentina",
    lat: "-34.60372",
    lon: "-58.38157",
  },
];

export function pickPopularAddresses(count = 5): PopularAddress[] {
  const pool = [...POPULAR_ADDRESSES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

let sessionPick: PopularAddress[] | null = null;

/** Cache the first list on the client so Soft navigations / remounts stay stable.
 * Never cache on the server — the module is shared across requests and would
 * cause hydration mismatches. */
export function rememberPopularAddresses(
  addresses: PopularAddress[]
): PopularAddress[] {
  if (typeof window === "undefined") {
    return addresses;
  }
  if (!sessionPick) {
    sessionPick = addresses;
  }
  return sessionPick;
}