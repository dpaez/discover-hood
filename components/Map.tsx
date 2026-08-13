"use client";

import {
  Map as LibreMap,
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl
} from 'react-map-gl/maplibre';import { setWorkerUrl } from "maplibre-gl";
import { Flag } from 'lucide-react';


setWorkerUrl("/maplibre-gl-worker.mjs");

export default function Map({ lat, lon }: { lat: string; lon: string }) {
  return (
    <LibreMap
      onError={(error) => console.error("Map error:", error)}
      initialViewState={{
        longitude: parseFloat(lon),
        latitude: parseFloat(lat),
        zoom: 14,
      }}
      style={{ width: 600, height: 400 }}
      mapStyle={`https://tiles.locationiq.com/v3/streets/vector.json?key=${process.env.NEXT_PUBLIC_MAPTILER_ACCESS_TOKEN}`}
    >
      <Marker 
        key={`marker-${lat}-${lon}`} 
        longitude={parseFloat(lon)} 
        latitude={parseFloat(lat)} 
        anchor="bottom">
        <Flag className="stroke-green-500 fill-green-500 stroke-3" />
      </Marker>
    </LibreMap>
  );
}
