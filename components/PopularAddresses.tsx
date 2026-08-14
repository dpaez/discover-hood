import Link from "next/link";
import { Link as LinkIcon } from "lucide-react";

import { POPULAR_ADDRESSES } from "@/lib/popular-addresses";

export default function PopularAddresses() {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-bold">Popular Locations</h3>
      <ul className="list-none flex flex-col gap-2">
        {POPULAR_ADDRESSES.map((address) => (
          <li
            key={`${address.lat}-${address.lon}`}
            className=" flex items-center justify-start gap-2 overflow-hidden h-6"
          >
            <Link
              className="text-sm hover:text-blue-500 truncate cursor-pointer"
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
