const nearbyAPIEndpoint = (lat: number, lon: number, radius: number, accessToken: string) => `https://us1.locationiq.com/v1/nearby?key=${accessToken}&lat=${lat}&lon=${lon}&tag=POI&radius=${radius}&format=json`

const WALKING_RADIUS = 1000; // radius is in meters
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



const getWalkingScore = (walkingData: NearbyResponse[]) => {
  const walkingAmenities = walkingData.filter((feature: NearbyResponse) => feature.class === "amenity").length
  const walkingBusinesses = walkingData.filter((feature: NearbyResponse) => feature.type === "business").length
  return {
    walkingScore: walkingAmenities + walkingBusinesses, // calculate density based score
    walkingAmenities,
    walkingBusinesses
  }
}
const getDrivingScore = (drivingData: NearbyResponse[]) => {
  const drivingAmenities = drivingData.filter((feature: NearbyResponse) => feature.class === "amenity").length
  const drivingBusinesses = drivingData.filter((feature: NearbyResponse) => feature.class === "business").length
  // calculate driving score based on density
  const drivingScore = (drivingAmenities + drivingBusinesses) / drivingData.length;
  return {
    drivingScore,
    drivingAmenities,
    drivingBusinesses
  }
}

const getUrbanIndex = (walkingScore: number, drivingScore: number, walkingAmenities: number, drivingAmenities: number, walkingBusinesses: number, drivingBusinesses: number) => {
  return {
    urbanIndex: (walkingScore + drivingScore) / (walkingAmenities + drivingAmenities + walkingBusinesses + drivingBusinesses)
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  if (!lat || !lon) {
    return Response.json({ error: "Lat and lon are required" }, { status: 400 });
  }
  
  const accessToken = process.env.LOCATIONIQ_ACCESS_TOKEN;
  if (!accessToken) {
    return Response.json({ error: "Access token is required" }, { status: 400 });
  }

  const [walkingResponse, drivingResponse] = await Promise.all([
    fetch(nearbyAPIEndpoint(Number(lat), Number(lon), WALKING_RADIUS, accessToken)),
    fetch(nearbyAPIEndpoint(Number(lat), Number(lon), DRIVING_RADIUS, accessToken))
  ]);

  const [walkingData, drivingData] = await Promise.all([
    walkingResponse.json(),
    drivingResponse.json()
  ]);

  // calculate WALKINGscore
  const {walkingScore, walkingAmenities, walkingBusinesses } = getWalkingScore(walkingData);
  const {drivingScore, drivingAmenities, drivingBusinesses } = getDrivingScore(drivingData);
  const urbanIndex = getUrbanIndex(walkingScore, drivingScore, walkingAmenities, drivingAmenities, walkingBusinesses, drivingBusinesses);

  return Response.json({ walkingScore, drivingScore, urbanIndex, walkingAmenities, drivingAmenities, walkingBusinesses, drivingBusinesses });
}

