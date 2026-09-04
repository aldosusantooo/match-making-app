"use client";

import { useEffect, useRef, useState } from "react";
import { APP_NAME } from "@/lib/constants";
import { BrandMarkIcon, MenuIcon } from "./icons";

export interface MenuItem {
  label: string;
  onSelect: () => void;
}

/**
 * Light header: brand mark + name on the left, menu button on the right
 * (spec §4.1). Replaces the old dark-green band.
 */
export function AppHeader({ menuItems }: { menuItems: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="flex items-center justify-between px-5 pt-2.5 pb-1.5">
      <div className="flex items-center gap-2 font-display text-[13px] font-bold text-green">
        <span className="grid h-[22px] w-[22px] place-items-center rounded-[7px] bg-green text-white">
          <BrandMarkIcon />
        </span>
        {APP_NAME}
      </div>

      <div className="relative" ref={root}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Open menu"
          aria-haspopup="menu"
          aria-expanded={open}
          className="grid h-[34px] w-[34px] place-items-center rounded-icon border border-line bg-surface text-ink"
        >
          <MenuIcon />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute top-[calc(100%+6px)] right-0 z-30 min-w-[160px] overflow-hidden rounded-btn border border-line bg-surface py-1 shadow-card"
          >
            {menuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className="block w-full px-3.5 py-2.5 text-left text-[15px] font-semibold text-ink active:bg-green-soft"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
