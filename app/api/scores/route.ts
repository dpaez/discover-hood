import { checkRateLimit } from "@/lib/rate-limit";
import { CACHE_CONTROL, nearby } from "@/lib/locationiq";
import { NearbyResponse } from "@/app/types";

const WALKING_RADIUS = 800; // radius is in meters
const DRIVING_RADIUS = 8000; // radius is in meters - weird values but locationIQ seems to be using a distance with a different unit metric
const USE_MOCK_NEARBY = process.env.USE_MOCK_NEARBY === "true";

export interface ScoreResponse {
  walkingScore: number;
  walkingAmenities: NearbyResponse[];
  drivingScore: number;
  drivingAmenities: NearbyResponse[];
  urbanIndex: number;
}

const WALKING_WEIGHTS: Record<string, number> = {
  cafe: 1.5,
  restaurant: 1.2,
  pub: 1.0,
  park: 1.5,
  playground: 1.2,
  shop: 1.0,
  library: 1.2,
  museum: 1.2,
  monument: 1.0,
  theatre: 1.0,
  cinema: 1.0,
  gym: 1.0,
};

const DRIVING_WEIGHTS: Record<string, number> = {
  hospital: 2.0,
  supermarket: 1.5,
  school: 1.5,
  bank: 1.0,
  parking: 0.8,
  stadium: 1.0,
};

const WALKING_SATURATION = 12;
const DRIVING_SATURATION = 10;

function clampScore10(weighted: number, saturation: number) {
  if (weighted <= 0) return 1;
  const t = Math.min(weighted / saturation, 1);
  return Math.max(1, Math.min(10, Math.round(1 + t * 9)));
}

function scoreFromWeights(
  data: NearbyResponse[],
  weights: Record<string, number>,
  saturation: number,
) {
  const amenities = data.filter((place) => place.type in weights);
  const weighted = amenities.reduce(
    (sum, place) => sum + (weights[place.type] ?? 0),
    0,
  );

  return {
    score: clampScore10(weighted, saturation),
    amenities,
    weighted,
  };
}

const getWalkingScore = (walkingData: NearbyResponse[]) => {
  const { score, amenities, weighted } = scoreFromWeights(
    walkingData,
    WALKING_WEIGHTS,
    WALKING_SATURATION,
  );

  return {
    walkingScore: score,
    walkingAmenities: amenities,
    walkingWeighted: weighted,
  };
};

const mockWalkingData: NearbyResponse[] = [
  {
    "place_id": "324235268594",
    "osm_id": "357621260",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.815",
    "lon": "-73.9363889",
    "boundingbox": [
      "40.81495",
      "40.81505",
      "-73.9364389",
      "-73.9363389"
    ],
    "class": "amenity",
    "type": "post_office",
    "tag_type": "post_office",
    "name": "Lincolnton Station New York Post Office",
    "display_name": "Lincolnton Station New York Post Office, 2266, 5th Avenue, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Lincolnton Station New York Post Office",
      "house_number": "2266",
      "road": "5th Avenue",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 27
  },
  {
    "place_id": "324148248920",
    "osm_id": "13244020809",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8144946",
    "lon": "-73.9361483",
    "boundingbox": [
      "40.8144446",
      "40.8145446",
      "-73.9361983",
      "-73.9360983"
    ],
    "class": "amenity",
    "type": "bicycle_rental",
    "tag_type": "bicycle_rental",
    "name": "Citi Bike - E 138 St & 5 Ave",
    "display_name": "Citi Bike - E 138 St & 5 Ave, East 138th Street, Manhattan Community Board 11, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Citi Bike - E 138 St & 5 Ave",
      "road": "East 138th Street",
      "neighbourhood": "Manhattan Community Board 11",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 55
  },
  {
    "place_id": "320559116604",
    "osm_id": "13244047113",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8154936",
    "lon": "-73.9358586",
    "boundingbox": [
      "40.8154436",
      "40.8155436",
      "-73.9359086",
      "-73.9358086"
    ],
    "class": "amenity",
    "type": "bicycle_rental",
    "tag_type": "bicycle_rental",
    "name": "Citi Bike - 5 Ave & W 139 St",
    "display_name": "Citi Bike - 5 Ave & W 139 St, West 139th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Citi Bike - 5 Ave & W 139 St",
      "road": "West 139th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 58
  },
  {
    "place_id": "320738643618",
    "osm_id": "2767707740",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8142537",
    "lon": "-73.9367717",
    "boundingbox": [
      "40.8142037",
      "40.8143037",
      "-73.9368217",
      "-73.9367217"
    ],
    "class": "amenity",
    "type": "restaurant",
    "tag_type": "restaurant",
    "name": "Kennedy Fried Chicken & Pizza",
    "display_name": "Kennedy Fried Chicken & Pizza, 2252, 5th Avenue, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Kennedy Fried Chicken & Pizza",
      "house_number": "2252",
      "road": "5th Avenue",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 101
  },
  {
    "place_id": "321968622721",
    "osm_id": "2328530257",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8156373",
    "lon": "-73.9350592",
    "boundingbox": [
      "40.8155873",
      "40.8156873",
      "-73.9351092",
      "-73.9350092"
    ],
    "class": "amenity",
    "type": "drinking_water",
    "tag_type": "drinking_water",
    "display_name": "2301, 5th Avenue, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "house_number": "2301",
      "road": "5th Avenue",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 110
  },
  {
    "place_id": "321405311341",
    "osm_id": "222365713",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.81592065",
    "lon": "-73.93487429",
    "boundingbox": [
      "40.8143539",
      "40.8167488",
      "-73.9359738",
      "-73.9344547"
    ],
    "class": "landuse",
    "type": "residential",
    "tag_type": "residential",
    "name": "Riverbend Houses",
    "display_name": "Riverbend Houses, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Riverbend Houses",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 143
  },
  {
    "place_id": "321688895044",
    "osm_id": "224025207",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.81555365",
    "lon": "-73.93775917",
    "boundingbox": [
      "40.8153108",
      "40.8157965",
      "-73.9381463",
      "-73.937372"
    ],
    "class": "leisure",
    "type": "playground",
    "tag_type": "playground",
    "name": "McCray Playground",
    "display_name": "McCray Playground, West 138th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "McCray Playground",
      "road": "West 138th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 156
  },
  {
    "place_id": "321357532900",
    "osm_id": "225191605",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8147593",
    "lon": "-73.93410344",
    "boundingbox": [
      "40.8098765",
      "40.819842",
      "-73.9348102",
      "-73.9338095"
    ],
    "class": "leisure",
    "type": "park",
    "tag_type": "park",
    "name": "Harlem River Drive Park",
    "display_name": "Harlem River Drive Park, United States",
    "address": {
      "name": "Harlem River Drive Park",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 166
  },
  {
    "place_id": "324221607267",
    "osm_id": "357621742",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8157285",
    "lon": "-73.938129",
    "boundingbox": [
      "40.8156785",
      "40.8157785",
      "-73.938179",
      "-73.938079"
    ],
    "class": "amenity",
    "type": "school",
    "tag_type": "school",
    "name": "Saint Mark the Evangelist School",
    "display_name": "Saint Mark the Evangelist School, 55, West 138th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Saint Mark the Evangelist School",
      "house_number": "55",
      "road": "West 138th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 192
  },
  {
    "place_id": "324064581481",
    "osm_id": "357621275",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8156402",
    "lon": "-73.9382199",
    "boundingbox": [
      "40.8155902",
      "40.8156902",
      "-73.9382699",
      "-73.9381699"
    ],
    "class": "amenity",
    "type": "school",
    "tag_type": "school",
    "name": "Saint Mark the Evangelist Preschool",
    "display_name": "Saint Mark the Evangelist Preschool, 55, West 138th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Saint Mark the Evangelist Preschool",
      "house_number": "55",
      "road": "West 138th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 195
  }
]

const mockDrivingData: NearbyResponse[] = [
  {
    "place_id": "324235268594",
    "osm_id": "357621260",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.815",
    "lon": "-73.9363889",
    "boundingbox": [
      "40.81495",
      "40.81505",
      "-73.9364389",
      "-73.9363389"
    ],
    "class": "amenity",
    "type": "post_office",
    "tag_type": "post_office",
    "name": "Lincolnton Station New York Post Office",
    "display_name": "Lincolnton Station New York Post Office, 2266, 5th Avenue, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Lincolnton Station New York Post Office",
      "house_number": "2266",
      "road": "5th Avenue",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 27
  },
  {
    "place_id": "324148248920",
    "osm_id": "13244020809",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8144946",
    "lon": "-73.9361483",
    "boundingbox": [
      "40.8144446",
      "40.8145446",
      "-73.9361983",
      "-73.9360983"
    ],
    "class": "amenity",
    "type": "bicycle_rental",
    "tag_type": "bicycle_rental",
    "name": "Citi Bike - E 138 St & 5 Ave",
    "display_name": "Citi Bike - E 138 St & 5 Ave, East 138th Street, Manhattan Community Board 11, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Citi Bike - E 138 St & 5 Ave",
      "road": "East 138th Street",
      "neighbourhood": "Manhattan Community Board 11",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 55
  },
  {
    "place_id": "320559116604",
    "osm_id": "13244047113",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8154936",
    "lon": "-73.9358586",
    "boundingbox": [
      "40.8154436",
      "40.8155436",
      "-73.9359086",
      "-73.9358086"
    ],
    "class": "amenity",
    "type": "bicycle_rental",
    "tag_type": "bicycle_rental",
    "name": "Citi Bike - 5 Ave & W 139 St",
    "display_name": "Citi Bike - 5 Ave & W 139 St, West 139th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Citi Bike - 5 Ave & W 139 St",
      "road": "West 139th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 58
  },
  {
    "place_id": "320738643618",
    "osm_id": "2767707740",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8142537",
    "lon": "-73.9367717",
    "boundingbox": [
      "40.8142037",
      "40.8143037",
      "-73.9368217",
      "-73.9367217"
    ],
    "class": "amenity",
    "type": "restaurant",
    "tag_type": "restaurant",
    "name": "Kennedy Fried Chicken & Pizza",
    "display_name": "Kennedy Fried Chicken & Pizza, 2252, 5th Avenue, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Kennedy Fried Chicken & Pizza",
      "house_number": "2252",
      "road": "5th Avenue",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 101
  },
  {
    "place_id": "321968622721",
    "osm_id": "2328530257",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8156373",
    "lon": "-73.9350592",
    "boundingbox": [
      "40.8155873",
      "40.8156873",
      "-73.9351092",
      "-73.9350092"
    ],
    "class": "amenity",
    "type": "drinking_water",
    "tag_type": "drinking_water",
    "display_name": "2301, 5th Avenue, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "house_number": "2301",
      "road": "5th Avenue",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 110
  },
  {
    "place_id": "321405311341",
    "osm_id": "222365713",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.81592065",
    "lon": "-73.93487429",
    "boundingbox": [
      "40.8143539",
      "40.8167488",
      "-73.9359738",
      "-73.9344547"
    ],
    "class": "landuse",
    "type": "residential",
    "tag_type": "residential",
    "name": "Riverbend Houses",
    "display_name": "Riverbend Houses, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Riverbend Houses",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 143
  },
  {
    "place_id": "321688895044",
    "osm_id": "224025207",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.81555365",
    "lon": "-73.93775917",
    "boundingbox": [
      "40.8153108",
      "40.8157965",
      "-73.9381463",
      "-73.937372"
    ],
    "class": "leisure",
    "type": "playground",
    "tag_type": "playground",
    "name": "McCray Playground",
    "display_name": "McCray Playground, West 138th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "McCray Playground",
      "road": "West 138th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 156
  },
  {
    "place_id": "321357532900",
    "osm_id": "225191605",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8147593",
    "lon": "-73.93410344",
    "boundingbox": [
      "40.8098765",
      "40.819842",
      "-73.9348102",
      "-73.9338095"
    ],
    "class": "leisure",
    "type": "park",
    "tag_type": "park",
    "name": "Harlem River Drive Park",
    "display_name": "Harlem River Drive Park, United States",
    "address": {
      "name": "Harlem River Drive Park",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 166
  },
  {
    "place_id": "324221607267",
    "osm_id": "357621742",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8157285",
    "lon": "-73.938129",
    "boundingbox": [
      "40.8156785",
      "40.8157785",
      "-73.938179",
      "-73.938079"
    ],
    "class": "amenity",
    "type": "school",
    "tag_type": "school",
    "name": "Saint Mark the Evangelist School",
    "display_name": "Saint Mark the Evangelist School, 55, West 138th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Saint Mark the Evangelist School",
      "house_number": "55",
      "road": "West 138th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 192
  },
  {
    "place_id": "324064581481",
    "osm_id": "357621275",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8156402",
    "lon": "-73.9382199",
    "boundingbox": [
      "40.8155902",
      "40.8156902",
      "-73.9382699",
      "-73.9381699"
    ],
    "class": "amenity",
    "type": "school",
    "tag_type": "school",
    "name": "Saint Mark the Evangelist Preschool",
    "display_name": "Saint Mark the Evangelist Preschool, 55, West 138th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Saint Mark the Evangelist Preschool",
      "house_number": "55",
      "road": "West 138th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 195
  },
  {
    "place_id": "322041926989",
    "osm_id": "386103671",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.81309445",
    "lon": "-73.93597728",
    "boundingbox": [
      "40.8118245",
      "40.8144857",
      "-73.9373935",
      "-73.9347432"
    ],
    "class": "landuse",
    "type": "residential",
    "tag_type": "residential",
    "name": "Riverton Square Apartments",
    "display_name": "Riverton Square Apartments, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Riverton Square Apartments",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 211
  },
  {
    "place_id": "323901641691",
    "osm_id": "222363904",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.81682035",
    "lon": "-73.93702479",
    "boundingbox": [
      "40.8154648",
      "40.8183166",
      "-73.9384098",
      "-73.9351039"
    ],
    "class": "landuse",
    "type": "residential",
    "tag_type": "residential",
    "name": "Savoy Park",
    "display_name": "Savoy Park, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Savoy Park",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 219
  },
  {
    "place_id": "321921895307",
    "osm_id": "271827342",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8158658",
    "lon": "-73.93855151",
    "boundingbox": [
      "40.8157388",
      "40.8160366",
      "-73.9386941",
      "-73.9383769"
    ],
    "class": "amenity",
    "type": "place_of_worship",
    "tag_type": "place_of_worship",
    "name": "Saint Mark's Roman Catholic Church",
    "display_name": "Saint Mark's Roman Catholic Church, 59, West 138th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Saint Mark's Roman Catholic Church",
      "house_number": "59",
      "road": "West 138th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 231
  },
  {
    "place_id": "323740410135",
    "osm_id": "870985128",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.81698335",
    "lon": "-73.93495307",
    "boundingbox": [
      "40.8166808",
      "40.8172853",
      "-73.935282",
      "-73.9346248"
    ],
    "class": "amenity",
    "type": "school",
    "tag_type": "school",
    "name": "Global Community Charter School",
    "display_name": "Global Community Charter School, West 141st Street, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Global Community Charter School",
      "road": "West 141st Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 240
  },
  {
    "place_id": "321786087699",
    "osm_id": "1450101355",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8134397",
    "lon": "-73.93824685",
    "boundingbox": [
      "40.8133706",
      "40.8135155",
      "-73.9383495",
      "-73.9381437"
    ],
    "class": "leisure",
    "type": "playground",
    "tag_type": "playground",
    "name": "Bennett Park Playground",
    "display_name": "Bennett Park Playground, West 135th Street, Harlem, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Bennett Park Playground",
      "road": "West 135th Street",
      "neighbourhood": "Harlem",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 252
  },
  {
    "place_id": "323492228212",
    "osm_id": "118524668",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.81363785",
    "lon": "-73.93863505",
    "boundingbox": [
      "40.8131672",
      "40.8141092",
      "-73.9393562",
      "-73.9379134"
    ],
    "class": "leisure",
    "type": "park",
    "tag_type": "park",
    "name": "Howard Bennett Playground",
    "display_name": "Howard Bennett Playground, United States",
    "address": {
      "name": "Howard Bennett Playground",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 264
  },
  {
    "place_id": "322022584635",
    "osm_id": "562540012",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8147102",
    "lon": "-73.93927818",
    "boundingbox": [
      "40.8135527",
      "40.8152561",
      "-73.9405535",
      "-73.9370962"
    ],
    "class": "amenity",
    "type": "hospital",
    "tag_type": "hospital",
    "name": "NYC Health + Hospitals/Harlem",
    "display_name": "NYC Health + Hospitals/Harlem, 506, Malcolm X Boulevard, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "NYC Health + Hospitals/Harlem",
      "house_number": "506",
      "road": "Malcolm X Boulevard",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 272
  },
  {
    "place_id": "323105516088",
    "osm_id": "357621124",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8154954",
    "lon": "-73.9392632",
    "boundingbox": [
      "40.8154454",
      "40.8155454",
      "-73.9393132",
      "-73.9392132"
    ],
    "class": "amenity",
    "type": "place_of_worship",
    "tag_type": "place_of_worship",
    "name": "Union Congregational Church",
    "display_name": "Union Congregational Church, 540, Malcolm X Boulevard, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Union Congregational Church",
      "house_number": "540",
      "road": "Malcolm X Boulevard",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 275
  },
  {
    "place_id": "322343068999",
    "osm_id": "2328530250",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8136788",
    "lon": "-73.9389616",
    "boundingbox": [
      "40.8136288",
      "40.8137288",
      "-73.9390116",
      "-73.9389116"
    ],
    "class": "amenity",
    "type": "toilets",
    "tag_type": "toilets",
    "display_name": "23, West 135th Street, Harlem, Manhattan, New York, New York, 10037, United States",
    "address": {
      "house_number": "23",
      "road": "West 135th Street",
      "neighbourhood": "Harlem",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 284
  },
  {
    "place_id": "322684308710",
    "osm_id": "10969577294",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8169403",
    "lon": "-73.9384196",
    "boundingbox": [
      "40.8168903",
      "40.8169903",
      "-73.9384696",
      "-73.9383696"
    ],
    "class": "amenity",
    "type": "restaurant",
    "tag_type": "restaurant",
    "name": "El Valle Seafood Restaurant ",
    "display_name": "El Valle Seafood Restaurant , 588, Malcolm X Boulevard, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "El Valle Seafood Restaurant ",
      "house_number": "588",
      "road": "Malcolm X Boulevard",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 294
  },
  {
    "place_id": "320431211993",
    "osm_id": "10570594107",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8170044",
    "lon": "-73.9383736",
    "boundingbox": [
      "40.8169544",
      "40.8170544",
      "-73.9384236",
      "-73.9383236"
    ],
    "class": "shop",
    "type": "supermarket",
    "tag_type": "supermarket",
    "name": "Key Food",
    "display_name": "Key Food, 592, Malcolm X Boulevard, Manhattan Community Board 10, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Key Food",
      "house_number": "592",
      "road": "Malcolm X Boulevard",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 296
  },
  {
    "place_id": "322191998563",
    "osm_id": "13244016949",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8136215",
    "lon": "-73.939312",
    "boundingbox": [
      "40.8135715",
      "40.8136715",
      "-73.939362",
      "-73.939262"
    ],
    "class": "amenity",
    "type": "bicycle_rental",
    "tag_type": "bicycle_rental",
    "name": "Citi Bike - W 135 St & Lenox Terrace Pl",
    "display_name": "Citi Bike - W 135 St & Lenox Terrace Pl, West 135th Street, Harlem, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Citi Bike - W 135 St & Lenox Terrace Pl",
      "road": "West 135th Street",
      "neighbourhood": "Harlem",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 313
  },
  {
    "place_id": "320925090101",
    "osm_id": "118524678",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.81219815",
    "lon": "-73.93715172",
    "boundingbox": [
      "40.811815",
      "40.8125811",
      "-73.9377778",
      "-73.9365256"
    ],
    "class": "leisure",
    "type": "park",
    "tag_type": "park",
    "name": "Abraham Lincoln Playground",
    "display_name": "Abraham Lincoln Playground, United States",
    "address": {
      "name": "Abraham Lincoln Playground",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 323
  },
  {
    "place_id": "323185349671",
    "osm_id": "2767633739",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8130784",
    "lon": "-73.9390136",
    "boundingbox": [
      "40.8130284",
      "40.8131284",
      "-73.9390636",
      "-73.9389636"
    ],
    "class": "amenity",
    "type": "pharmacy",
    "tag_type": "pharmacy",
    "name": "Lenox Terrace",
    "display_name": "Lenox Terrace, 20, West 135th Street, Harlem, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Lenox Terrace",
      "house_number": "20",
      "road": "West 135th Street",
      "neighbourhood": "Harlem",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 327
  },
  {
    "place_id": "324126368035",
    "osm_id": "13243877783",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8172439",
    "lon": "-73.9387621",
    "boundingbox": [
      "40.8171939",
      "40.8172939",
      "-73.9388121",
      "-73.9387121"
    ],
    "class": "amenity",
    "type": "bicycle_rental",
    "tag_type": "bicycle_rental",
    "name": "Citi Bike - Lenox Ave & W 140 St",
    "display_name": "Citi Bike - Lenox Ave & W 140 St, Malcolm X Boulevard, Manhattan Community Board 10, Manhattan, New York, New York, 10030, United States",
    "address": {
      "name": "Citi Bike - Lenox Ave & W 140 St",
      "road": "Malcolm X Boulevard",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10030",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 338
  },
  {
    "place_id": "323354154489",
    "osm_id": "13244000315",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8121989",
    "lon": "-73.9378367",
    "boundingbox": [
      "40.8121489",
      "40.8122489",
      "-73.9378867",
      "-73.9377867"
    ],
    "class": "amenity",
    "type": "bicycle_rental",
    "tag_type": "bicycle_rental",
    "name": "Citi Bike - 5 Ave & E 135 St",
    "display_name": "Citi Bike - 5 Ave & E 135 St, 5th Avenue, Harlem, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Citi Bike - 5 Ave & E 135 St",
      "road": "5th Avenue",
      "neighbourhood": "Harlem",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 344
  },
  {
    "place_id": "323435729346",
    "osm_id": "10969603645",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.815615",
    "lon": "-73.9401039",
    "boundingbox": [
      "40.815565",
      "40.815665",
      "-73.9401539",
      "-73.9400539"
    ],
    "class": "shop",
    "type": "convenience",
    "tag_type": "convenience",
    "name": "NYCity Grill Deli",
    "display_name": "NYCity Grill Deli, West 137th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10030, United States",
    "address": {
      "name": "NYCity Grill Deli",
      "road": "West 137th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10030",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 347
  },
  {
    "place_id": "321240027564",
    "osm_id": "2767778130",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8174709",
    "lon": "-73.9387241",
    "boundingbox": [
      "40.8174209",
      "40.8175209",
      "-73.9387741",
      "-73.9386741"
    ],
    "class": "shop",
    "type": "convenience",
    "tag_type": "convenience",
    "name": "Esam Deli",
    "display_name": "Esam Deli, 585, Malcolm X Boulevard, Manhattan Community Board 10, Manhattan, New York, New York, 10030, United States",
    "address": {
      "name": "Esam Deli",
      "house_number": "585",
      "road": "Malcolm X Boulevard",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10030",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 355
  },
  {
    "place_id": "324273226979",
    "osm_id": "224026097",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8171615",
    "lon": "-73.93922034",
    "boundingbox": [
      "40.8168178",
      "40.8175051",
      "-73.9396258",
      "-73.9388149"
    ],
    "class": "leisure",
    "type": "playground",
    "tag_type": "playground",
    "name": "Fred Samuel Playground",
    "display_name": "Fred Samuel Playground, West 139th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10030, United States",
    "address": {
      "name": "Fred Samuel Playground",
      "road": "West 139th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10030",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 359
  },
  {
    "place_id": "323338098663",
    "osm_id": "271822571",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8128392",
    "lon": "-73.93933571",
    "boundingbox": [
      "40.8126343",
      "40.8130311",
      "-73.9395993",
      "-73.9390721"
    ],
    "class": "leisure",
    "type": "fitness_centre",
    "tag_type": "fitness_centre",
    "name": "Hansborough Recreation Center",
    "display_name": "Hansborough Recreation Center, 35, West 134th Street, Lenox Terrace, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Hansborough Recreation Center",
      "house_number": "35",
      "road": "West 134th Street",
      "neighbourhood": "Lenox Terrace",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 365
  },
  {
    "place_id": "321427658321",
    "osm_id": "10969598287",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8151323",
    "lon": "-73.940449",
    "boundingbox": [
      "40.8150823",
      "40.8151823",
      "-73.940499",
      "-73.940399"
    ],
    "class": "shop",
    "type": "convenience",
    "tag_type": "convenience",
    "name": "527 Convenience store",
    "display_name": "527 Convenience store, 527, Malcolm X Boulevard, Manhattan Community Board 10, Manhattan, New York, New York, 10030, United States",
    "address": {
      "name": "527 Convenience store",
      "house_number": "527",
      "road": "Malcolm X Boulevard",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10030",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 369
  },
  {
    "place_id": "323694893477",
    "osm_id": "10969605150",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8150983",
    "lon": "-73.94047",
    "boundingbox": [
      "40.8150483",
      "40.8151483",
      "-73.94052",
      "-73.94042"
    ],
    "class": "amenity",
    "type": "fast_food",
    "tag_type": "fast_food",
    "name": "Dunkin'",
    "display_name": "Dunkin', 525, Malcolm X Boulevard, Manhattan Community Board 10, Manhattan, New York, New York, 10030, United States",
    "address": {
      "name": "Dunkin'",
      "house_number": "525",
      "road": "Malcolm X Boulevard",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10030",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 371
  },
  {
    "place_id": "322139095101",
    "osm_id": "275269248",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8145086",
    "lon": "-73.93164507",
    "boundingbox": [
      "40.8143329",
      "40.8148199",
      "-73.9319612",
      "-73.9313287"
    ],
    "class": "shop",
    "type": "storage_rental",
    "tag_type": "storage_rental",
    "name": "CubeSmart",
    "display_name": "CubeSmart, 1, East 138th Street, Mott Haven, The Bronx, New York, New York, 10451, United States",
    "address": {
      "name": "CubeSmart",
      "house_number": "1",
      "road": "East 138th Street",
      "neighbourhood": "Mott Haven",
      "suburb": "The Bronx",
      "city": "New York",
      "state": "New York",
      "postcode": "10451",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 375
  },
  {
    "place_id": "321354825835",
    "osm_id": "10969580738",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8149755",
    "lon": "-73.9405625",
    "boundingbox": [
      "40.8149255",
      "40.8150255",
      "-73.9406125",
      "-73.9405125"
    ],
    "class": "shop",
    "type": "convenience",
    "tag_type": "convenience",
    "name": "Exquisite Grill Deli",
    "display_name": "Exquisite Grill Deli, West 136th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10030, United States",
    "address": {
      "name": "Exquisite Grill Deli",
      "road": "West 136th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10030",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 379
  },
  {
    "place_id": "321507308958",
    "osm_id": "2767778168",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8179115",
    "lon": "-73.9384039",
    "boundingbox": [
      "40.8178615",
      "40.8179615",
      "-73.9384539",
      "-73.9383539"
    ],
    "class": "shop",
    "type": "convenience",
    "tag_type": "convenience",
    "name": "Right Way City",
    "display_name": "Right Way City, 619, Malcolm X Boulevard, Manhattan Community Board 10, Manhattan, New York, New York, 10030, United States",
    "address": {
      "name": "Right Way City",
      "house_number": "619",
      "road": "Malcolm X Boulevard",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10030",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 380
  },
  {
    "place_id": "320086081063",
    "osm_id": "3545220728",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8150396",
    "lon": "-73.9407349",
    "boundingbox": [
      "40.8149896",
      "40.8150896",
      "-73.9407849",
      "-73.9406849"
    ],
    "class": "amenity",
    "type": "restaurant",
    "tag_type": "restaurant",
    "name": "Easy Corner",
    "display_name": "Easy Corner, 101, West 136th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10030, United States",
    "address": {
      "name": "Easy Corner",
      "house_number": "101",
      "road": "West 136th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10030",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 393
  },
  {
    "place_id": "321282718323",
    "osm_id": "271822573",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.81360195",
    "lon": "-73.94039677",
    "boundingbox": [
      "40.8134204",
      "40.8137578",
      "-73.940583",
      "-73.9402003"
    ],
    "class": "amenity",
    "type": "place_of_worship",
    "tag_type": "place_of_worship",
    "name": "A.M.E. Metropolitan Church",
    "display_name": "A.M.E. Metropolitan Church, 58, West 135th Street, Harlem, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "A.M.E. Metropolitan Church",
      "house_number": "58",
      "road": "West 135th Street",
      "neighbourhood": "Harlem",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 396
  },
  {
    "place_id": "321457210908",
    "osm_id": "3545220727",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8150731",
    "lon": "-73.9408019",
    "boundingbox": [
      "40.8150231",
      "40.8151231",
      "-73.9408519",
      "-73.9407519"
    ],
    "class": "shop",
    "type": "beauty",
    "tag_type": "beauty",
    "name": "Nails Professional",
    "display_name": "Nails Professional, 101-A, West 136th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10030, United States",
    "address": {
      "name": "Nails Professional",
      "house_number": "101-A",
      "road": "West 136th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10030",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 399
  },
  {
    "place_id": "324045004532",
    "osm_id": "6822486482",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8168971",
    "lon": "-73.9401414",
    "boundingbox": [
      "40.8168471",
      "40.8169471",
      "-73.9401914",
      "-73.9400914"
    ],
    "class": "shop",
    "type": "car",
    "tag_type": "car",
    "name": "Car Dealer NY",
    "display_name": "Car Dealer NY, 112, West 139th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10030, United States",
    "address": {
      "name": "Car Dealer NY",
      "house_number": "112",
      "road": "West 139th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10030",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 403
  },
  {
    "place_id": "322103907717",
    "osm_id": "3545220726",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8151634",
    "lon": "-73.9409521",
    "boundingbox": [
      "40.8151134",
      "40.8152134",
      "-73.9410021",
      "-73.9409021"
    ],
    "class": "shop",
    "type": "funeral_directors",
    "tag_type": "funeral_directors",
    "name": "St. Helena Funeral Home",
    "display_name": "St. Helena Funeral Home, 107, West 136th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10030, United States",
    "address": {
      "name": "St. Helena Funeral Home",
      "house_number": "107",
      "road": "West 136th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10030",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 412
  },
  {
    "place_id": "323870097501",
    "osm_id": "815531420",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.81145005",
    "lon": "-73.9375645",
    "boundingbox": [
      "40.8102739",
      "40.8126434",
      "-73.9389195",
      "-73.936241"
    ],
    "class": "landuse",
    "type": "residential",
    "tag_type": "residential",
    "name": "Lincoln Houses",
    "display_name": "Lincoln Houses, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Lincoln Houses",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 413
  },
  {
    "place_id": "321637741747",
    "osm_id": "6296848309",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8184147",
    "lon": "-73.9380432",
    "boundingbox": [
      "40.8183647",
      "40.8184647",
      "-73.9380932",
      "-73.9379932"
    ],
    "class": "shop",
    "type": "hairdresser",
    "tag_type": "hairdresser",
    "name": "Harlem Masters",
    "display_name": "Harlem Masters, 633, Malcolm X Boulevard, Manhattan Community Board 10, Manhattan, New York, New York, 10030, United States",
    "address": {
      "name": "Harlem Masters",
      "house_number": "633",
      "road": "Malcolm X Boulevard",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10030",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 415
  },
  {
    "place_id": "321511755289",
    "osm_id": "271825823",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8146476",
    "lon": "-73.94098739",
    "boundingbox": [
      "40.8143427",
      "40.8149246",
      "-73.9412107",
      "-73.9406789"
    ],
    "class": "amenity",
    "type": "library",
    "tag_type": "library",
    "name": "Schomburg Center for Research in Black Culture",
    "display_name": "Schomburg Center for Research in Black Culture, 505, Malcolm X Boulevard, Harlem, Manhattan, New York, New York, 10030, United States",
    "address": {
      "name": "Schomburg Center for Research in Black Culture",
      "house_number": "505",
      "road": "Malcolm X Boulevard",
      "neighbourhood": "Harlem",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10030",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 416
  },
  {
    "place_id": "323140360684",
    "osm_id": "3545220725",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8152071",
    "lon": "-73.9410594",
    "boundingbox": [
      "40.8151571",
      "40.8152571",
      "-73.9411094",
      "-73.9410094"
    ],
    "class": "amenity",
    "type": "place_of_worship",
    "tag_type": "place_of_worship",
    "name": "The Universal Temple of Spiritual Truth",
    "display_name": "The Universal Temple of Spiritual Truth, 111, West 136th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10030, United States",
    "address": {
      "name": "The Universal Temple of Spiritual Truth",
      "house_number": "111",
      "road": "West 136th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10030",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 421
  },
  {
    "place_id": "323615783686",
    "osm_id": "5171042767",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8112136",
    "lon": "-73.9353331",
    "boundingbox": [
      "40.8111636",
      "40.8112636",
      "-73.9353831",
      "-73.9352831"
    ],
    "class": "amenity",
    "type": "community_centre",
    "tag_type": "community_centre",
    "name": "Lincoln East Senior Center",
    "display_name": "Lincoln East Senior Center, 60, East 135th Street, Lincoln Houses, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Lincoln East Senior Center",
      "house_number": "60",
      "road": "East 135th Street",
      "neighbourhood": "Lincoln Houses",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 424
  },
  {
    "place_id": "320696386182",
    "osm_id": "3545220730",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8126493",
    "lon": "-73.9400429",
    "boundingbox": [
      "40.8125993",
      "40.8126993",
      "-73.9400929",
      "-73.9399929"
    ],
    "class": "amenity",
    "type": "community_centre",
    "tag_type": "community_centre",
    "name": "Lt. Joseph P. Kennedy Center",
    "display_name": "Lt. Joseph P. Kennedy Center, 34, West 134th Street, Lenox Terrace, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Lt. Joseph P. Kennedy Center",
      "house_number": "34",
      "road": "West 134th Street",
      "neighbourhood": "Lenox Terrace",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 424
  },
  {
    "place_id": "323386545521",
    "osm_id": "10570592044",
    "osm_type": "node",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8185364",
    "lon": "-73.9379651",
    "boundingbox": [
      "40.8184864",
      "40.8185864",
      "-73.9380151",
      "-73.9379151"
    ],
    "class": "shop",
    "type": "convenience",
    "tag_type": "convenience",
    "name": "Exper SS Deli",
    "display_name": "Exper SS Deli, West 142nd Street, Manhattan Community Board 10, Manhattan, New York, New York, 10030, United States",
    "address": {
      "name": "Exper SS Deli",
      "road": "West 142nd Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10030",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 425
  },
  {
    "place_id": "320387144891",
    "osm_id": "271825697",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.81484215",
    "lon": "-73.94114316",
    "boundingbox": [
      "40.8147326",
      "40.8150126",
      "-73.9413044",
      "-73.9409485"
    ],
    "class": "amenity",
    "type": "library",
    "tag_type": "library",
    "name": "Countee Cullen Library",
    "display_name": "Countee Cullen Library, 104, West 136th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10030, United States",
    "address": {
      "name": "Countee Cullen Library",
      "house_number": "104",
      "road": "West 136th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10030",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 428
  },
  {
    "place_id": "321362227936",
    "osm_id": "796488147",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8124483",
    "lon": "-73.93992182",
    "boundingbox": [
      "40.8109551",
      "40.8140063",
      "-73.942066",
      "-73.9377691"
    ],
    "class": "landuse",
    "type": "residential",
    "tag_type": "residential",
    "name": "Lenox Terrace",
    "display_name": "Lenox Terrace, Manhattan, New York, New York, 10037, United States",
    "address": {
      "name": "Lenox Terrace",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10037",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 430
  },
  {
    "place_id": "323708902076",
    "osm_id": "224026928",
    "osm_type": "way",
    "licence": "https://locationiq.com/attribution",
    "lat": "40.8161253",
    "lon": "-73.9410548",
    "boundingbox": [
      "40.8159686",
      "40.816282",
      "-73.9412227",
      "-73.9408869"
    ],
    "class": "leisure",
    "type": "garden",
    "tag_type": "garden",
    "name": "Elizabeth Langley Memorial Garden",
    "display_name": "Elizabeth Langley Memorial Garden, West 137th Street, Manhattan Community Board 10, Manhattan, New York, New York, 10030, United States",
    "address": {
      "name": "Elizabeth Langley Memorial Garden",
      "road": "West 137th Street",
      "neighbourhood": "Manhattan Community Board 10",
      "suburb": "Manhattan",
      "city": "New York",
      "state": "New York",
      "postcode": "10030",
      "country": "United States",
      "country_code": "us"
    },
    "distance": 439
  }
]

const getDrivingScore = (drivingData: NearbyResponse[]) => {
  const { score, amenities, weighted } = scoreFromWeights(
    drivingData,
    DRIVING_WEIGHTS,
    DRIVING_SATURATION,
  );

  return {
    drivingScore: score,
    drivingAmenities: amenities,
    drivingWeighted: weighted,
  };
};

const getUrbanIndex = (
  walkingScore: number,
  drivingScore: number,
  walkingAmenities: NearbyResponse[],
  drivingAmenities: NearbyResponse[],
) => {
  // 8–80 from walk + drive (each 1–10)
  let urban = walkingScore * 4 + drivingScore * 4;

  const walkCafes = walkingAmenities.filter((p) => p.type === "cafe").length;
  const walkParks = walkingAmenities.filter((p) =>
    ["park", "playground"].includes(p.type),
  ).length;
  const driveHospitals = drivingAmenities.filter(
    (p) => p.type === "hospital",
  ).length;
  const driveGroceries = drivingAmenities.filter(
    (p) => p.type === "supermarket",
  ).length;

  urban += Math.min(walkCafes, 3) * 2;
  urban += Math.min(walkParks, 2) * 3;
  urban += Math.min(driveHospitals, 2) * 4;
  urban += Math.min(driveGroceries, 2) * 3;

  return Math.max(1, Math.min(100, Math.round(urban)));
};

export async function GET(request: Request) {
  const { rateLimited, resetAt } = checkRateLimit(request);
  if (rateLimited) {
    return Response.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  if (!lat || !lon) {
    return Response.json({ error: "Lat and lon are required" }, { status: 400 });
  }

  const accessToken = process.env.GEOLOCATIONIQ_ACCESS_TOKEN;
  if (!accessToken) {
    return Response.json(
      { error: "Access token is required" },
      { status: 400 },
    );
  }

  const parsedLat = parseFloat(lat);
  const parsedLon = parseFloat(lon);
  if (isNaN(parsedLat) || isNaN(parsedLon)) {
    return Response.json(
      { error: "Lat and lon must be valid numbers" },
      { status: 400 },
    );
  }

  let walkingData: NearbyResponse[];
  let drivingData: NearbyResponse[];

  if (USE_MOCK_NEARBY) {
    walkingData = mockWalkingData;
    drivingData = mockDrivingData;
  } else {
    // Sequential to respect LocationIQ rate limits; each call is fetch-cached for 1h
    const walkingResult = await nearby(parsedLat, parsedLon, WALKING_RADIUS);
    // LocationIQ free tier is often ~2 req/s; space the second nearby call
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const drivingResult = await nearby(parsedLat, parsedLon, DRIVING_RADIUS);

    if (!Array.isArray(walkingResult) || !Array.isArray(drivingResult)) {
      const walkingError = Array.isArray(walkingResult)
        ? undefined
        : walkingResult;
      const drivingError = Array.isArray(drivingResult)
        ? undefined
        : drivingResult;
      return Response.json(
        {
          error: "Failed to fetch data",
          walkingStatus: walkingError?.status,
          drivingStatus: drivingError?.status,
          walkingBody: walkingError?.error,
          drivingBody: drivingError?.error,
        },
        { status: 502 },
      );
    }

    walkingData = walkingResult;
    drivingData = drivingResult;
  }

  const { walkingScore, walkingAmenities } = getWalkingScore(walkingData);
  const { drivingScore, drivingAmenities } = getDrivingScore(drivingData);
  const urbanIndex = getUrbanIndex(
    walkingScore,
    drivingScore,
    walkingAmenities,
    drivingAmenities,
  );

  return Response.json(
    {
      walkingScore,
      drivingScore,
      urbanIndex,
      walkingAmenities,
      drivingAmenities,
    },
    {
      headers: { "Cache-Control": CACHE_CONTROL.scores },
    },
  );
}

