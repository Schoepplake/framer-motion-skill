"use client";

import { cn } from "@/components/ui";

export interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Mobile device frame for the PENNY App preview (UC08).
 * A clean, modern phone silhouette with notch, hardware buttons and
 * a scrollable viewport inside.
 */
export function PhoneFrame({ children, className }: PhoneFrameProps) {
  return (
    <div
      className={cn(
        "relative mx-auto select-none",
        // Phone outer shell
        "h-[720px] w-[360px] rounded-[48px] border-[3px] border-neutral-800 bg-neutral-900 shadow-2xl shadow-black/50",
        className,
      )}
    >
      {/* Side buttons — volume up */}
      <div className="absolute -left-[5px] top-[120px] h-10 w-1 rounded-l-full bg-neutral-700" />
      {/* Side buttons — volume down */}
      <div className="absolute -left-[5px] top-[170px] h-10 w-1 rounded-l-full bg-neutral-700" />
      {/* Side buttons — power */}
      <div className="absolute -right-[5px] top-[150px] h-14 w-1 rounded-r-full bg-neutral-700" />

      {/* Screen area */}
      <div className="absolute inset-[4px] overflow-hidden rounded-[44px] bg-white">
        {/* Status bar */}
        <div className="flex h-11 items-center justify-between px-6 text-[11px] font-semibold text-neutral-800">
          <span>9:41</span>
          {/* Notch */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2">
            <div className="h-7 w-32 rounded-b-2xl bg-neutral-900" />
          </div>
          {/* Status icons */}
          <div className="flex items-center gap-1.5">
            <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" className="opacity-80">
              <rect x="0" y="3" width="3" height="9" rx="0.5" />
              <rect x="4.5" y="2" width="3" height="10" rx="0.5" />
              <rect x="9" y="0.5" width="3" height="11.5" rx="0.5" />
              <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" className="opacity-80">
              <path d="M8 2.4a7 7 0 0 1 4.95 2.05l1.41-1.41A9 9 0 0 0 8 0a9 9 0 0 0-6.36 3.04L3.05 4.45A7 7 0 0 1 8 2.4z"/>
              <path d="M8 5.6a3.5 3.5 0 0 1 2.47 1.02l1.42-1.42A5.5 5.5 0 0 0 8 3.6a5.5 5.5 0 0 0-3.89 1.6L5.53 6.62A3.5 3.5 0 0 1 8 5.6z"/>
              <circle cx="8" cy="10" r="1.5"/>
            </svg>
            <div className="flex items-center gap-0.5">
              <div className="h-3 w-6 rounded-sm border border-current opacity-80 p-px">
                <div className="h-full w-[70%] rounded-[1px] bg-current" />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="h-[calc(100%-44px-28px)] overflow-y-auto overflow-x-hidden">
          {children}
        </div>

        {/* Home indicator */}
        <div className="flex h-7 items-end justify-center pb-2">
          <div className="h-1 w-28 rounded-full bg-neutral-800/40" />
        </div>
      </div>
    </div>
  );
}
