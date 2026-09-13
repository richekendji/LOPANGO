"use client";

import { useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Icon } from "@/components/Icon";
import { InstantTabLink, useInstantNav } from "@/components/InstantNav";
import { hasActiveSubscription, refreshSubscriptionStatus, subscribeStore } from "@/lib/mock/store";

const PUBLISH_FORM = "/dashboard/houses/new";
const PUBLISH_PAY =
  "/paiement?contexte=publier&retour=" + encodeURIComponent(PUBLISH_FORM);

const BASE_TABS = [
  { href: "/app", label: "Accueil", icon: "home" as const },
  { href: "/app/search", label: "Recherche", icon: "search" as const },
  {
    href: PUBLISH_FORM,
    label: "Publier",
    icon: "publish" as const,
    publish: true as const,
  },
  { href: "/app/inbox", label: "Messages", icon: "inbox" as const },
  { href: "/app/profile", label: "Profil", icon: "user" as const },
];

export function FeedBottomNav() {
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const refresh = () => setSubscribed(hasActiveSubscription());
    refresh();
    void refreshSubscriptionStatus().then(setSubscribed);
    return subscribeStore(refresh);
  }, []);

  const prefetchHrefs = useMemo(
    () => [
      "/app",
      "/app/search",
      "/app/inbox",
      "/app/profile",
      PUBLISH_FORM,
      "/paiement",
      subscribed ? PUBLISH_FORM : PUBLISH_PAY,
    ],
    [subscribed],
  );

  const { arm, isHot, pathname } = useInstantNav(prefetchHrefs);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#ebebeb] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1.5">
        {BASE_TABS.map((tab) => {
          const href =
            "publish" in tab && tab.publish
              ? subscribed
                ? PUBLISH_FORM
                : PUBLISH_PAY
              : tab.href;
          const pathActive =
            tab.href === "/app"
              ? pathname === "/app"
              : "publish" in tab && tab.publish
                ? pathname.includes("/houses/new") ||
                  pathname.includes("/edit") ||
                  pathname.startsWith("/paiement")
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const active = isHot(tab.label, pathActive);
          return (
            <InstantTabLink
              key={tab.label}
              href={href}
              tabKey={tab.label}
              active={active}
              onArm={arm}
              className={`flex min-w-[3.5rem] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium ${
                active ? "text-zinc-900" : "text-zinc-400"
              }`}
            >
              <Icon
                name={tab.icon}
                className={`h-5 w-5 ${active ? "stroke-[2.25]" : ""}`}
              />
              <span>{tab.label}</span>
            </InstantTabLink>
          );
        })}
      </div>
    </nav>
  );
}

export function FeedHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[#f5f5f5]/95 px-4 pb-2.5 pt-3 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-center">
        <BrandLogo href="/app" size="sm" />
      </div>
    </header>
  );
}

export function FeedShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-zinc-900">
      <FeedHeader />
      <div className="mx-auto max-w-lg pb-24">{children}</div>
      <FeedBottomNav />
    </div>
  );
}
