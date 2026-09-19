"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Icon } from "@/components/Icon";
import { InstantTabLink, useInstantNav } from "@/components/InstantNav";
import { hasActiveSubscription, refreshSubscriptionStatus, subscribeStore } from "@/lib/mock/store";

const PUBLISH_FORM = "/dashboard/houses/new";
const PUBLISH_PAY =
  "/paiement?contexte=publier&retour=" + encodeURIComponent(PUBLISH_FORM);

function BottomNav() {
  const [subscribed, setSubscribed] = useState(false);
  const [isAgent, setIsAgent] = useState(false);

  useEffect(() => {
    const refresh = () => setSubscribed(hasActiveSubscription());
    refresh();
    void refreshSubscriptionStatus().then(setSubscribed);
    fetch("/api/agent/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { agent?: boolean } | null) => setIsAgent(Boolean(d?.agent)))
      .catch(() => setIsAgent(false));
    return subscribeStore(refresh);
  }, []);

  const tabs = useMemo(() => {
    return [
      { href: "/app", label: "Accueil", icon: "home" as const },
      { href: "/dashboard/houses", label: "Annonces", icon: "building" as const },
      {
        href: PUBLISH_FORM,
        label: "Publier",
        icon: "publish" as const,
        publish: true as const,
      },
      isAgent
        ? {
            href: "/app/gains",
            label: "Retirer",
            icon: "wallet" as const,
          }
        : {
            href: "/app/inbox",
            label: "Réclamation",
            icon: "inbox" as const,
          },
      { href: "/app/profile", label: "Profil", icon: "user" as const },
    ];
  }, [isAgent]);

  const prefetchHrefs = useMemo(
    () => [
      "/app",
      "/dashboard/houses",
      isAgent ? "/app/gains" : "/app/inbox",
      "/app/profile",
      PUBLISH_FORM,
      "/paiement",
      isAgent || subscribed ? PUBLISH_FORM : PUBLISH_PAY,
    ],
    [subscribed, isAgent],
  );

  const { arm, isHot, pathname } = useInstantNav(prefetchHrefs);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#ebebeb] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-2">
        {tabs.map((tab) => {
          const href =
            "publish" in tab && tab.publish && !isAgent
              ? subscribed
                ? PUBLISH_FORM
                : PUBLISH_PAY
              : tab.href;
          const pathActive =
            tab.href === "/dashboard/houses"
              ? pathname.startsWith("/dashboard/houses") &&
                !pathname.includes("/new")
              : "publish" in tab && tab.publish
                ? pathname.includes("/new") ||
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
              className={`flex min-w-[3.5rem] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium ${
                active ? "text-zinc-900" : "text-zinc-400"
              }`}
            >
              <Icon name={tab.icon} className="h-6 w-6" />
              <span>{tab.label}</span>
            </InstantTabLink>
          );
        })}
      </div>
    </nav>
  );
}

export function SellerShell({
  children,
  title,
  backHref,
}: {
  children: React.ReactNode;
  title?: string;
  backHref?: string;
}) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-zinc-900">
      <header className="sticky top-0 z-40 border-b border-[#ebebeb]/80 bg-[#f5f5f5]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          {backHref ? (
            <Link
              href={backHref}
              prefetch
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold shadow-sm active:opacity-70"
            >
              ←
            </Link>
          ) : (
            <BrandLogo href="/app" size="sm" />
          )}
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[15px] font-bold">
              {title ?? "LOPANGO"}
            </p>
          </div>
          <Link
            href="/app"
            prefetch
            aria-label="Accueil"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm active:opacity-70"
          >
            <Icon name="home" className="h-4 w-4" />
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-lg px-4 pb-28 pt-4">{children}</div>
      <BottomNav />
    </div>
  );
}
