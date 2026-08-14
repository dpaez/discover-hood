"use client";

import { useState } from "react";
import {
  Map as LibreMap,
  Marker,
  Popup
} from 'react-map-gl/maplibre';import { setWorkerUrl } from "maplibre-gl";
import { Flag, Footprints, Car } from 'lucide-react';
import { NearbyResponse } from '@/app/types';


setWorkerUrl("/maplibre-gl-worker.mjs");

export default function Map({ lat, lon, walkingAmenities = [], drivingAmenities = [] }: { lat: string; lon: string; walkingAmenities: NearbyResponse[]; drivingAmenities: NearbyResponse[]; }) {
  const [popupInfo, setPopupInfo] = useState(null);

  const walkingMarkers = walkingAmenities.map((amenity) => (
    <Marker 
      key={`footprints-${amenity.lat}-${amenity.lon}`} 
      longitude={parseFloat(amenity.lon)} 
      latitude={parseFloat(amenity.lat)} 
      anchor="bottom"
      onClick={e => {
        e.originalEvent.stopPropagation();
        setPopupInfo(amenity);
      }}
      >
      <Footprints className="fill-amber-600 stroke-amber-600" />
    </Marker>
  ));

  const drivingMarkers = drivingAmenities.map((amenity) => (
    <Marker 
      key={`car-${amenity.lat}-${amenity.lon}`} 
      longitude={parseFloat(amenity.lon)} 
      latitude={parseFloat(amenity.lat)} 
      anchor="bottom"
      onClick={e => {
        e.originalEvent.stopPropagation();
        setPopupInfo(amenity);
      }}
      >
      <Car className="fill-indigo-300 stroke-indigo-300" />
    </Marker>
  ));

  const addressMarker = (
    <Marker 
      key={`marker-${lat}-${lon}`} 
      longitude={parseFloat(lon)} 
      latitude={parseFloat(lat)} 
      anchor="bottom">
      <Flag className="stroke-green-500 fill-green-500 stroke-3" />
    </Marker>
  )

  const markers = [...walkingMarkers, ...drivingMarkers, addressMarker];

  return (
    <LibreMap
      onError={(error) => console.error("Map error:", error)}
      initialViewState={{
        longitude: parseFloat(lon),
        latitude: parseFloat(lat),
        zoom: 16,
      }}
      style={{ width: 800, height: 600, borderRadius: 10 }}
      mapStyle={`https://tiles.locationiq.com/v3/streets/vector.json?key=${process.env.NEXT_PUBLIC_MAPTILER_ACCESS_TOKEN}`}
    >
      {markers}

      {popupInfo && (
        <Popup
          anchor="top"
          longitude={Number(popupInfo.lon)}
          latitude={Number(popupInfo.lat)}
          onClose={() => setPopupInfo(null)}
        >
          <div>
            <h4 className="text-lg font-heading">{popupInfo?.name}</h4>
            <p className="text-sm text-muted-foreground capitalize font-bold font-mono">{popupInfo.type}</p>
            <p className="text-sm text-muted-foreground">{popupInfo?.display_name}</p>
          </div>
        </Popup>
      )}
    </LibreMap>
  );
}
