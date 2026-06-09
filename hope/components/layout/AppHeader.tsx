"use client";

import Link from "next/link";
import { useMissionStore } from "@/lib/store/missionStore";

export function AppHeader() {
  const user = useMissionStore((s) => s.currentUser);
  const initialen = user
    .split(" ")
    .map((t) => t[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 focus-ring rounded-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-fg shadow-sm">
            H
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-fg">HOPE</span>
            <span className="text-[11px] text-fg-muted">Gewinnspiel-Missionen</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-fg-muted hover:bg-surface-2 hover:text-fg sm:block focus-ring"
          >
            Missionen
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
              {initialen}
            </span>
            <span className="text-sm font-medium text-fg">{user}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
