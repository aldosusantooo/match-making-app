"use client";

import { useEffect, useRef } from "react";

/**
 * Every bit of scroll behaviour on the homepage (spec §5), in one effect:
 * the progress line, the staggered reveals, the word-by-word statement and
 * the parallax layers. Native scroll and an IntersectionObserver — no
 * animation library, and the stacking step cards are plain CSS `sticky`
 * with no JavaScript at all.
 *
 * Bails out entirely under `prefers-reduced-motion: reduce` and under
 * `?static=1` (which screenshots use), marking the document `data-motion=off`
 * so the stylesheet renders every element in its finished state.
 */
export function HomeMotion() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isStatic = new URLSearchParams(window.location.search).has("static");

    if (reduced || isStatic) {
      root.dataset.motion = "off";
      return () => {
        delete root.dataset.motion;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    for (const element of document.querySelectorAll("[data-reveal]")) {
      observer.observe(element);
    }

    const statement = document.querySelector("[data-words]");
    const words = [...document.querySelectorAll("[data-word]")];
    const layers = [
      ...document.querySelectorAll<HTMLElement>("[data-speed]"),
    ];

    let frame = 0;

    const update = () => {
      frame = 0;

      const scrollable = root.scrollHeight - root.clientHeight;
      if (bar.current) {
        bar.current.style.width =
          scrollable > 0 ? `${(root.scrollTop / scrollable) * 100}%` : "0%";
      }

      // Words light up as the block crosses the viewport: fully lit once its
      // top has travelled 80% of the way up, spread over its own height plus
      // a bit of runway so a tall paragraph doesn't finish instantly.
      if (statement) {
        const rect = statement.getBoundingClientRect();
        const progress = Math.min(
          1,
          Math.max(
            0,
            (window.innerHeight * 0.8 - rect.top) /
              (rect.height + window.innerHeight * 0.3),
          ),
        );
        const lit = Math.round(progress * words.length);
        words.forEach((word, index) => word.classList.toggle("on", index < lit));
      }

      for (const layer of layers) {
        const speed = Number(layer.dataset.speed);
        layer.style.setProperty(
          "--parallax-y",
          `${(window.scrollY * speed).toFixed(1)}px`,
        );
      }
    };

    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden
      ref={bar}
      className="fixed top-0 left-0 z-60 h-0.5 w-0 bg-green transition-[width] duration-100 ease-linear"
    >
      <span className="absolute -top-[3px] -right-1 h-2 w-2 rounded-full bg-live shadow-[0_0_0_4px_rgba(245,158,11,0.25)]" />
    </div>
  );
}
