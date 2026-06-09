"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** Info-Icon mit Tooltip für erklärungsbedürftige Felder (NFR-USAB-009). */
export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="Hilfe anzeigen"
        aria-describedby={open ? id : undefined}
        className="flex h-4 w-4 items-center justify-center rounded-full bg-surface-2 text-[10px] font-bold text-fg-muted hover:bg-border focus-ring"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        i
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg bg-fg px-3 py-2 text-xs font-normal leading-relaxed text-white shadow-pop"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
