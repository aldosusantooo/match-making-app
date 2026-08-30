"use client";

import type { ReactNode } from "react";
import { CourtTexture } from "@/components/court-texture";
import { BandClose, HeaderBand } from "@/components/header-band";

/** Bottom-sheet modal shell: primary header band + court-textured body. */
export function Overlay({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 sm:items-center">
      <div className="w-full max-w-sm overflow-hidden rounded-t-2xl bg-bg shadow-lg sm:rounded-2xl">
        <HeaderBand
          title={title}
          action={<BandClose onClose={onClose} />}
          className="pt-3.5 pb-4"
        />
        <div className="relative overflow-hidden p-4 pb-6">
          <CourtTexture />
          <div className="relative z-[1]">{children}</div>
        </div>
      </div>
    </div>
  );
}
