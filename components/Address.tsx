"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import useSWR from "swr";
import { LocationIQAutocomplete } from "@/app/types";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const LISTBOX_ID = "address-listbox";

type AddressListProps = {
  items: LocationIQAutocomplete[];
  activeIndex: number;
  onSelect: (item: LocationIQAutocomplete) => void;
  onActiveIndexChange: (index: number) => void;
  error?: Error;
};

function AddressList({
  items,
  activeIndex,
  onSelect,
  onActiveIndexChange,
  error,
}: AddressListProps) {
  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  if (items.length === 0) return null;

  return (
    <div className="relative z-10">
      <ul
        id={LISTBOX_ID}
        role="listbox"
        className="absolute top-full left-0 w-full list-none grid grid-cols-1 gap-2 mt-4"
      >
        {items.map((item, index) => {
          const optionId = `address-option-${index}`;
          const isActive = index === activeIndex;

          return (
            <li
              key={`${item.place_id}-${index}`}
              id={optionId}
              role="option"
              aria-selected={isActive}
              aria-label={item.display_name}
              onClick={() => onSelect(item)}
              onMouseEnter={() => onActiveIndexChange(index)}
            >
              <div
                className={cn(
                  "flex flex-col px-4 truncate cursor-pointer text-white py-1 rounded-full",
                  isActive ? "bg-olive-800" : "bg-olive-700 hover:bg-olive-800",
                )}
              >
                <p className="text-md">{item.display_name}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface AddressProps {
  setLatLon: ({ lat, lon }: { lat: string; lon: string }) => void;
  initialLat?: string | undefined;
  initialLon?: string | undefined;
  initialAddress?: string | undefined;
}

export default function Address({
  setLatLon,
  initialLat,
  initialLon,
  initialAddress,
}: AddressProps) {
  const [address, setAddress] = useState<string>(initialAddress || "");
  const [showList, setShowList] = useState(
    !(initialAddress || (initialLat && initialLon)),
  );
  const [activeIndex, setActiveIndex] = useState(-1);

  const searchParams = useSearchParams();
  const router = useRouter();

  const { data, error } = useSWR(
    showList && address.length > 3
      ? `/api/latlon?address=${encodeURIComponent(address)}`
      : null,
    fetcher,
  );

  const items: LocationIQAutocomplete[] = Array.isArray(data) ? data : [];
  const highlightedIndex =
    !showList || items.length === 0
      ? -1
      : Math.min(Math.max(activeIndex, 0), items.length - 1);

  const handleSelect = (item: LocationIQAutocomplete) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lat", item.lat);
    params.set("lon", item.lon);
    router.replace(`/?${params.toString()}`);
    setLatLon({ lat: item.lat, lon: item.lon });
    setAddress(item.display_name);

    const MAX_RECENT = 5;
    const recentSearches = JSON.parse(
      localStorage.getItem("searchHistory") || "[]",
    ) as { display_name: string; lat: string; lon: string }[];
    const withoutDup = recentSearches.filter(
      (s) => s.display_name !== item.display_name,
    );
    const next = [
      { display_name: item.display_name, lat: item.lat, lon: item.lon },
      ...withoutDup,
    ].slice(0, MAX_RECENT);
    localStorage.setItem("searchHistory", JSON.stringify(next));
    window.dispatchEvent(new Event("search-history-updated"));

    setShowList(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showList || items.length === 0) {
      if (e.key === "Escape") {
        setShowList(false);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setShowList(false);
      setActiveIndex(-1);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((index) => (index + 1) % items.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((index) =>
        index <= 0 ? items.length - 1 : index - 1,
      );
      return;
    }

    if (e.key === "Enter" && highlightedIndex >= 0 && items[highlightedIndex]) {
      e.preventDefault();
      handleSelect(items[highlightedIndex]);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <InputGroup className="w-full">
        <InputGroupInput
          id="address-input"
          role="combobox"
          aria-expanded={showList && items.length > 0}
          aria-controls={LISTBOX_ID}
          aria-autocomplete="list"
          aria-activedescendant={
            highlightedIndex >= 0
              ? `address-option-${highlightedIndex}`
              : undefined
          }
          value={address}
          onChange={(e) => {
            setShowList(true);
            setActiveIndex(0);
            setAddress(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Discover the neighbourhood..."
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>

      {showList && (
        <AddressList
          items={items}
          activeIndex={highlightedIndex}
          onSelect={handleSelect}
          onActiveIndexChange={setActiveIndex}
          error={error}
        />
      )}
    </div>
  );
}
