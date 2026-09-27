"use client";

import { useMemo } from "react";
import { Icon } from "@/components/Icon";
import { InstantTabLink, useInstantNav } from "@/components/InstantNav";

const PUBLISH_FORM = "/dashboard/houses/new";

export function FeedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-zinc-900">
      <div className="mx-auto max-w-lg pb-24 pt-3">{children}</div>
      <FeedBottomNav />
    </div>
  );
}

function FeedBottomNav() {
  const baseTabs = useMemo(() => {
    const tabs: {
      href: string;
      label: string;
      icon: "home" | "search" | "publish" | "inbox" | "user";
      publish?: true;
    }[] = [
      { href: "/app", label: "Accueil", icon: "home" },
      { href: "/app/search", label: "Recherche", icon: "search" },
      {
        href: PUBLISH_FORM,
        label: "Publier ma maison",
        icon: "publish",
        publish: true,
      },
      { href: "/app/inbox", label: "Réclamation", icon: "inbox" as const },
      { href: "/app/profile", label: "Profil", icon: "user" },
    ];
    return tabs;
  }, []);

  const prefetchHrefs = useMemo(
    () => [
      "/app",
      "/app/search",
      "/app/inbox",
      "/app/profile",
      PUBLISH_FORM,
    ],
    [],
  );

  const { arm, isHot, pathname } = useInstantNav(prefetchHrefs);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#ebebeb] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-2">
        {baseTabs.map((tab) => {
          const pathActive =
            tab.href === "/app"
              ? pathname === "/app"
              : "publish" in tab && tab.publish
                ? pathname.includes("/houses/new") ||
                  pathname.includes("/edit")
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const active = isHot(tab.label, pathActive);
          return (
            <InstantTabLink
              key={tab.label}
              href={tab.href}
              tabKey={tab.label}
              active={active}
              onArm={arm}
              className={`flex min-w-[3.5rem] flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-[11px] font-medium ${
                active ? "text-zinc-900" : "text-zinc-400"
              }`}
            >
              <Icon
                name={tab.icon}
                className={`h-6 w-6 ${active ? "stroke-[2.25]" : ""}`}
              />
              <span className="text-center leading-[1.15]">
                {"publish" in tab && tab.publish ? (
                  <>
                    Publier
                    <br />
                    ma maison
                  </>
                ) : (
                  tab.label
                )}
              </span>
            </InstantTabLink>
          );
        })}
      </div>
    </nav>
  );
}