export type LocationIQAddress = {
  attraction?: string;
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  county?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
};

export type LocationIQAutocomplete = {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon: string;
  address: LocationIQAddress;
};

export type LocationIQAutocompleteResponse = LocationIQAutocomplete[];

export type LocationIQReverseResponse = {
  place_id: string;
  display_name: string;
  address: LocationIQAddress;
};
