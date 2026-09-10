"use client";

import { useEffect, useState } from "react";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { Icon } from "@/components/Icon";
import { SEED_HOUSES, type SellerHouse } from "@/lib/mock/houses";
import { getHouses, getProfile, subscribeStore } from "@/lib/mock/store";

export default function AppHomePage() {
  const [bannerOpen, setBannerOpen] = useState(true);
  const [houses, setHouses] = useState<SellerHouse[]>(
    SEED_HOUSES.filter((h) => h.status === "active"),
  );
  const [username, setUsername] = useState("jean.dupont4821");

  useEffect(() => {
    const refresh = () => {
      const list = getHouses().filter((h) => h.status === "active");
      setHouses(list.length ? list : SEED_HOUSES.filter((h) => h.status === "active"));
      setUsername(getProfile().username);
    };
    refresh();
    return subscribeStore(refresh);
  }, []);

  return (
    <div className="px-4">
      {bannerOpen && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8eefc] text-[#1e3a8a]">
            <Icon name="home" className="h-5 w-5" />
          </span>
          <p className="flex-1 text-[13px] font-medium leading-snug text-zinc-800">
            Complete your profile to continue transactions at LOPANGO.
          </p>
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setBannerOpen(false)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <Icon name="close" className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="mt-4 space-y-5 pb-2">
        {houses.map((house) => (
          <FeedPostCard key={house.id} house={house} username={username} />
        ))}
      </div>
    </div>
  );
}
