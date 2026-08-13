import { checkRateLimit } from '@/lib/rate-limit'

const nearbyAPIEndpoint = (lat: number, lon: number, radius: number, accessToken: string) => `https://us1.locationiq.com/v1/nearby?key=${accessToken}&lat=${lat}&lon=${lon}&tag=all&radius=${radius}&format=json&limit=50`

const WALKING_RADIUS = 500; // radius is in meters
const DRIVING_RADIUS = 8000; // radius is in meters

interface NearbyResponse {
  place_id: string;
  osm_type: string;
  osm_id: string;
  lat: string;
  lon: string;
  class: string;
  type: string;
  tag_type: string;
  name: string;
  display_name: string;
  address: {
    name: string;
    road: string;
    suburb: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    country_code: string;
  }
  boundingbox: [string, string, string, string];
  distance: number;
} 

export interface ScoreResponse {
  walkingScore: number;
  walkingAmenities: NearbyResponse[]; 
  drivingScore: number;
  drivingAmenities: NearbyResponse[];
  urbanIndex: number;
}

const WALKING_INTERESTING_TYPES = [
  "restaurant",
  "pub",
  "cafe",
  "park",
  "library",
  "museum",
  "monument",
  "theatre",
  "cinema",
  "gym",
]

const getWalkingScore = (walkingData: NearbyResponse[]) => {
  // group by class
  const result = Object.groupBy(walkingData, (item) => item.type);
  // filter values from drivingData to only include the driving interesting types
  const walkingInterestingData = walkingData.filter((item) => WALKING_INTERESTING_TYPES.includes(item.type));
  console.log('--------------------------------');
  console.log({walkingInterestingData});
  console.log('--------------------------------');
  console.log({WalkingDataLength: walkingData.length});
  console.log('--------------------------------');

  // calculate walking amenities
  const walkingRestaurants = result.restaurant?.length || 0;
  
  const walkingBars = result.pub?.length || 0;
  const walkingCafes = result.cafe?.length || 0;
  
  const walkingParks = result.park?.length || 0;
  const walkingLibraries = result.library?.length || 0;
  const walkingMuseums = result.museum?.length || 0;
  const walkingMonuments = result.monument?.length || 0;
  const walkingTheatres = result.theatre?.length || 0;
  const walkingCinemas = result.cinema?.length || 0;
  const walkingGyms = result.gym?.length || 0;

  const totalFeatures = walkingData.length ? walkingData.length : 1;
  const walkingAmenitiesTotal = walkingRestaurants + walkingBars + walkingCafes + walkingParks + walkingLibraries + walkingMuseums + walkingMonuments + walkingTheatres + walkingCinemas + walkingGyms;

  return {
    walkingScore: walkingAmenitiesTotal / totalFeatures * 100, // calculate density based score
    walkingAmenities: walkingInterestingData,
    walkingAmenitiesTotal: totalFeatures,
  }
}

const DRIVING_INTERESTING_TYPES = [
  "restaurant",
  "pub",
  "cafe",
  "park",
  "library",
  "museum",
  "monument",
  "theatre",
  "cinema",
  "hospital",
  "school",
  "supermarket",
]

const getDrivingScore = (drivingData: NearbyResponse[]) => {
  const result = Object.groupBy(drivingData, (item) => item.type);

  // filter values from drivingData to only include the driving interesting types
  const drivingInterestingData = drivingData.filter((item) => DRIVING_INTERESTING_TYPES.includes(item.type));

  const drivingRestaurants = result.restaurant?.length || 0;
  const drivingBars = result.pub?.length || 0;
  const drivingCafes = result.cafe?.length || 0;
  const drivingParks = result.park?.length || 0;
  const drivingLibraries = result.library?.length || 0;
  const drivingMuseums = result.museum?.length || 0;
  const drivingMonuments = result.monument?.length || 0;
  const drivingTheatres = result.theatre?.length || 0;
  const drivingCinemas = result.cinema?.length || 0;
  const drivingHospitals = result.hospital?.length || 0;
  const drivingSchools = result.school?.length || 0;
  const drivingSupermarkets = result.supermarket?.length || 0;

  // calculate driving score based on density
  const totalFeatures = drivingData.length ? drivingData.length : 1;
  const drivingAmenitiesTotal = drivingRestaurants + drivingBars + drivingCafes + drivingParks + drivingLibraries + drivingMuseums + drivingMonuments + drivingTheatres + drivingCinemas + drivingHospitals + drivingSchools + drivingSupermarkets;
  return {
    drivingScore: drivingAmenitiesTotal / totalFeatures * 100,
    drivingAmenities: drivingInterestingData,
    drivingAmenitiesTotal: totalFeatures,
  }
}

const getUrbanIndex = (walkingScore: number, drivingScore: number, walkingAmenitiesTotal: number, drivingAmenitiesTotal: number) => {
  const totalFeatures = (walkingAmenitiesTotal + drivingAmenitiesTotal) || 1;
  
  return (walkingScore + drivingScore) / (totalFeatures) * 100
}

export async function GET(request: Request) {
  const { rateLimited, resetAt } = await checkRateLimit(request)
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
    return Response.json({ error: "Access token is required" }, { status: 400 });
  }

  const parsedLat = parseFloat(lat);
  const parsedLon = parseFloat(lon);
  if (isNaN(parsedLat) || isNaN(parsedLon)) {
    return Response.json({ error: "Lat and lon must be valid numbers" }, { status: 400 });
  }

  console.log(parsedLat, parsedLon);
  const [walkingResponse, drivingResponse] = await Promise.all([
    fetch(nearbyAPIEndpoint(parsedLat, parsedLon, WALKING_RADIUS, accessToken)),
    fetch(nearbyAPIEndpoint(parsedLat, parsedLon, DRIVING_RADIUS, accessToken))
  ]);


  if (walkingResponse.status === 404 || drivingResponse.status === 404) {
    return {walkingScore: null, drivingScore: null, urbanIndex: null, walkingAmenities: [], drivingAmenities: []};
  }
  // check if the response is ok
  if (!walkingResponse.ok || !drivingResponse.ok) {
    const walkingBody = await walkingResponse.text();
    const drivingBody = await drivingResponse.text();
    console.error({
      walking: { status: walkingResponse.status, body: walkingBody },
      driving: { status: drivingResponse.status, body: drivingBody },
    });
    
    return Response.json(
      {
        error: "Failed to fetch data",
        walkingStatus: walkingResponse.status,
        drivingStatus: drivingResponse.status,
        walkingBody,
        drivingBody,
      },
      { status: 502 },
    );

  }

  const [walkingData, drivingData] = await Promise.all([
    walkingResponse.json(),
    drivingResponse.json()
  ]);


  const {walkingScore, walkingAmenities, walkingAmenitiesTotal } = getWalkingScore(walkingData);
  const {drivingScore, drivingAmenities, drivingAmenitiesTotal } = getDrivingScore(drivingData);
  const urbanIndex = getUrbanIndex(walkingScore, drivingScore, walkingAmenitiesTotal, drivingAmenitiesTotal);
  console.log(walkingScore, drivingScore, urbanIndex, walkingAmenities, drivingAmenities);

  return Response.json({ walkingScore, drivingScore, urbanIndex, walkingAmenities, drivingAmenities });
}

