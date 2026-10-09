"use client";

import Script from "next/script";
import { UMAMI_WEBSITE_ID, createBeforeSend } from "@/lib/analytics";

const BEFORE_SEND = "bisaiUmamiBeforeSend";

// Umami looks the hook up by name on every send, starting with the page view
// it fires as soon as the script runs. Installing it while this module
// evaluates, during hydration, puts it in place before the afterInteractive
// script can load.
if (typeof window !== "undefined" && UMAMI_WEBSITE_ID) {
  Object.assign(window, { [BEFORE_SEND]: createBeforeSend() });
}

/** Umami Cloud tracker; renders nothing unless the deploy sets an id. */
export function Analytics() {
  if (!UMAMI_WEBSITE_ID) {
    return null;
  }
  return (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id={UMAMI_WEBSITE_ID}
      data-before-send={BEFORE_SEND}
    />
  );
}
