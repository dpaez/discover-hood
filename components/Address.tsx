"use client"

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";

import useSWR from "swr";
import { LocationIQAutocompleteResponse, LocationIQAutocomplete } from "@/app/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const AddressList = ({ data, setLatLon }: { data: LocationIQAutocompleteResponse, setLatLon: ({lat, lon}: {lat: string, lon: string}) => void }) => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleSelect = (item: LocationIQAutocomplete) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("lat", encodeURIComponent(item.lat))
    params.set("lon", encodeURIComponent(item.lon))
    router.replace(`/?${params.toString()}`);
    setLatLon({lat: item.lat, lon: item.lon});
  }

  return (
    <ul className="list-none grid grid-cols-1 gap-2 mt-4">
      {data.map((item: LocationIQAutocomplete, index: number) => (
        <li 
          key={`${item.place_id}-${index}`}
          aria-label={item.display_name} 
          role="button" 
          tabIndex={0} 
          onClick={() => handleSelect(item)} 
          >
          <div className="flex flex-col bg-olive-100 hover:bg-olive-200 cursor-pointer text-olive-700 p-1 rounded-full">
            <p className="text-md">{item.display_name}</p>
          </div>
          
        </li>
      ))}
    </ul>
  )
}

interface AddressProps {
  setLatLon: ({lat, lon}: {lat: string, lon: string}) => void;
  initialLat?: string;
  initialLon?: string;
}

export default function Address({ setLatLon, initialLat, initialLon }: AddressProps) {
  const [address, setAddress] = useState("");
  const {
    data = [],
    error,
    isLoading,
  } = useSWR(
    address.length > 3 ? `/api/latlon?address=${encodeURIComponent(address)}` : null,
    fetcher
  )
  
  // calculate address from initialLat and initialLon using reverse geocoding

  return (
    <div className="w-full max-w-2xl">
      <ButtonGroup className="w-full">
        <Input id="input-button-group" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your address..." />
        <Button variant="outline">Search</Button>
      </ButtonGroup>
      {error && <p className="text-red-500">Error: {error.message}</p>}

      {data.length > 0 && <AddressList data={data} setLatLon={setLatLon} />}
    </div>
  );
}