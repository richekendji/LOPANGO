"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Précharge les routes + surbrillance dès le touch/clic. */
export function useInstantNav(prefetchHrefs: string[] = []) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  useEffect(() => {
    setPendingKey(null);
  }, [pathname]);

  useEffect(() => {
    for (const href of prefetchHrefs) {
      try {
        router.prefetch(href.split("?")[0] || href);
      } catch {
        /* ignore */
      }
    }
  }, [router, prefetchHrefs]);

  function arm(key: string) {
    setPendingKey(key);
  }

  function isHot(key: string, pathActive: boolean) {
    return pendingKey === key || (pendingKey === null && pathActive);
  }

  return { arm, isHot, pathname, router };
}

export function InstantTabLink({
  href,
  tabKey,
  active,
  className,
  children,
  onArm,
}: {
  href: string;
  tabKey: string;
  active: boolean;
  className?: string;
  children: React.ReactNode;
  onArm: (key: string) => void;
}) {
  const router = useRouter();

  return (
    <Link
      href={href}
      prefetch
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        onArm(tabKey);
        // Démarre la nav au touch (plus rapide que d’attendre le click)
        router.prefetch(href.split("?")[0] || href);
      }}
      onClick={() => onArm(tabKey)}
      className={`${className ?? ""} transition-colors duration-75 active:opacity-70`}
      data-active={active ? "true" : "false"}
    >
      {children}
    </Link>
  );
}
