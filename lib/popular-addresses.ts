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
];
