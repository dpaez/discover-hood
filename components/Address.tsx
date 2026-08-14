"use client"

import { useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

import useSWR from "swr";
import { LocationIQAutocomplete } from "@/app/types";
import { Search } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const AddressList = ({ query, setLatLon, setAddress, onSelect }: { query: string, setLatLon: ({lat, lon}: {lat: string, lon: string}) => void, setAddress: (address: string) => void, onSelect: () => void }) => {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR(
    query.length > 3 ? `/api/latlon?address=${encodeURIComponent(query)}` : null,
    fetcher
  )
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleSelect = (item: LocationIQAutocomplete) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("lat", encodeURIComponent(item.lat))
    params.set("lon", encodeURIComponent(item.lon))
    router.replace(`/?${params.toString()}`);
    setLatLon({lat: item.lat, lon: item.lon});
    setAddress(item.display_name);

    // store search in local storage
    const recentSearches = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    // avoid duplicates
    if (!recentSearches.some((search: {display_name: string, lat: string, lon: string}) => search.display_name === item.display_name)) {
      const newRecentSearches = [...recentSearches, {display_name: item.display_name, lat: item.lat, lon: item.lon}];
      localStorage.setItem("searchHistory", JSON.stringify(newRecentSearches));
      window.dispatchEvent(new Event("search-history-updated"));
    }
    
    onSelect();
  }

  return (
    <>
      {error && <p className="text-red-500">Error: {error.message}</p>}
      <ul className="list-none grid grid-cols-1 gap-2 mt-4">
        {data?.length > 0 && data?.map((item: LocationIQAutocomplete, index: number) => (
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
    </>
  )
}

interface AddressProps {
  setLatLon: ({lat, lon}: {lat: string, lon: string}) => void;
  initialLat?: string | undefined;
  initialLon?: string | undefined;
  initialAddress?: string | undefined;
}

export default function Address({ setLatLon, initialLat, initialLon, initialAddress }: AddressProps) {
  const [address, setAddress] = useState<string>(initialAddress || "");
  const [showList, setShowList] = useState(!(initialAddress || (initialLat && initialLon)));
  
  return (
    <div className="w-full max-w-2xl">
      <InputGroup className="w-full">
        <InputGroupInput id="address-input" value={address} onChange={(e) => { setShowList(true); setAddress(e.target.value)} } placeholder="Discover the neighbourhood..." />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
      
      {showList && <AddressList 
        setAddress={setAddress} 
        query={address} 
        setLatLon={setLatLon} 
        onSelect={() => setShowList(false)}
      />}
    </div>
  );
}