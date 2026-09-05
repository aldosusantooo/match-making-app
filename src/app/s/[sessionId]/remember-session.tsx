"use client";

import { useEffect } from "react";
import { rememberSession } from "@/lib/recent-sessions";

/**
 * Files this session under "Sesi kamu" on the homepage (spec §7.1). Renders
 * nothing — it exists so that opening a session is enough to remember it,
 * whether the host just created it or came back via the link a week later.
 */
export function RememberSession({
  id,
  name,
  createdAt,
}: {
  id: string;
  name: string;
  createdAt: string;
}) {
  useEffect(() => {
    rememberSession({ id, name, createdAt });
  }, [id, name, createdAt]);

  return null;
}
