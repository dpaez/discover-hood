"use client";

import Link from "next/link";

import {
  rememberPopularAddresses,
  type PopularAddress,
} from "@/lib/popular-addresses";

export default function PopularAddresses({
  addresses: initial,
}: {
  addresses: PopularAddress[];
}) {
  const addresses = rememberPopularAddresses(initial);
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-bold">Popular Locations</h3>
      <ul className="list-none flex flex-col gap-2">
        {addresses.map((address) => (
          <li
            key={`${address.lat}-${address.lon}`}
            className="flex items-center justify-start gap-2 overflow-hidden h-6"
          >
            <Link
              className="text-sm hover:text-blue-500 truncate cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              href={`/?lat=${address.lat}&lon=${address.lon}`}
            >
              {address.display_name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
