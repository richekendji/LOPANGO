"use client";

import { useEffect, useState } from "react";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { SEED_HOUSES, type SellerHouse } from "@/lib/mock/houses";
import { getHouses, getProfile, subscribeStore } from "@/lib/mock/store";

export default function AppHomePage() {
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
      <div className="mt-4 space-y-5 pb-2">
        {houses.map((house) => (
          <FeedPostCard key={house.id} house={house} username={username} />
        ))}
      </div>
    </div>
  );
}
