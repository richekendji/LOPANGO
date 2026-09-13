import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Favoris",
  description: "Retrouvez vos maisons favorites sur LOPANGO.",
  path: "/app/saved",
});

export default function SavedPage() {
  return (
    <div className="px-4 py-10 text-center">
      <h1 className="text-lg font-bold text-zinc-900">Favoris</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Vos maisons favorites apparaîtront ici.
      </p>
    </div>
  );
}
