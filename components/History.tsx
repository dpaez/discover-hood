"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button"
import { Trash2, Link as LinkIcon } from "lucide-react";

import {
  subscribeToSearchHistory,
  getSearchHistorySnapshot,
  getSearchHistoryServerSnapshot,
} from "@/lib/syncLocalStorage";

type SearchEntry = {
  display_name: string;
  lat: string;
  lon: string;
};

export default function History() {
  const rawHistory = useSyncExternalStore(
    subscribeToSearchHistory,
    getSearchHistorySnapshot,
    getSearchHistoryServerSnapshot,
  );

  const searchHistory = useMemo(
    () => (JSON.parse(rawHistory) as SearchEntry[]).slice(0, 5),
    [rawHistory],
  );

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-bold">Recent Lookups</h3>
      <ul className="list-none flex flex-col gap-2">
        {searchHistory.map((search) => (
          <li
            key={`${search.lat}-${search.lon}`}
            className="flex items-center gap-2 overflow-hidden"
          > 
            <Link
              className="text-sm hover:text-blue-500 truncate cursor-pointer"
              href={`/?lat=${search.lat}&lon=${search.lon}`}
            >
              {search.display_name}
            </Link>
            <Button className="cursor-pointer" variant="ghost" size="icon-xs" onClick={() => {
              const newHistory = searchHistory.filter(
                (s) => !(s.lat === search.lat && s.lon === search.lon),
              );
              localStorage.setItem("searchHistory", JSON.stringify(newHistory));
              window.dispatchEvent(new Event("search-history-updated"));
            }}>  
              <Trash2
                className="size-4 hover:fill-gray-300 cursor-pointer"/>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}