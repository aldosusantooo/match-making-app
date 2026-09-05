import { BisaiMark } from "@/components/icons";
import { APP_NAME } from "@/lib/constants";

const LINKS = [
  { href: "#cara", label: "Cara pakai" },
  { href: "#kenapa", label: "Kenapa Bisai" },
  { href: "#footer", label: "Tentang" },
];

/**
 * Frosted sticky nav (spec §3.2). The only element on the page wider than
 * the 640px column. Reuses `AppHeader`'s mark but not its menu — the session
 * screen's menu acts on a session, and there isn't one here.
 */
export function SiteNav() {
  return (
    <nav data-nav className="sticky top-0 z-50 border-b border-[rgba(23,35,28,0.06)] bg-[rgba(246,247,243,0.78)] backdrop-blur-[14px]">
      <div className="mx-auto flex h-[60px] w-[min(1120px,calc(100%-40px))] items-center justify-between">
        <a
          href="#"
          className="flex items-center gap-2.5 font-display text-[15px] font-bold text-green"
        >
          <BisaiMark size={24} />
          {APP_NAME}
        </a>

        <div className="hidden gap-[26px] text-[14px] text-muted wide:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="#form"
          className="inline-flex items-center justify-center rounded-[10px] bg-green px-3.5 py-[9px] text-[13px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(6,96,63,0.6)] transition-[translate,scale,box-shadow] duration-200 ease-brand hover:-translate-y-px active:scale-97 hover:shadow-[0_14px_26px_-12px_rgba(6,96,63,0.7)]"
        >
          Mulai sesi
        </a>
      </div>
    </nav>
  );
}
