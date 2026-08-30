import { Button } from "@/components/button";
import { CourtTexture } from "@/components/court-texture";
import { HeaderBand } from "@/components/header-band";
import { createSession } from "./actions";

const inputClass =
  "rounded-lg border border-line bg-surface px-3 py-2.5 text-base outline-none focus:border-primary";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-sm flex-1">
      <HeaderBand
        title="Badminton session"
        subtitle="Run open play from your phone"
      />
      <div className="relative overflow-hidden px-4 pt-6 pb-12">
        <CourtTexture />
        <div className="relative z-[1]">
          <p className="text-sm text-muted">
            Start a session and get a private link to run it. No password, no
            email.
          </p>
          <form action={createSession} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[10.5px] font-medium tracking-[0.06em] text-muted uppercase">
                Your name
              </span>
              <input
                name="hostName"
                required
                autoComplete="name"
                className={inputClass}
                placeholder="e.g. Aji"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[10.5px] font-medium tracking-[0.06em] text-muted uppercase">
                Session name
              </span>
              <input
                name="sessionName"
                required
                className={inputClass}
                placeholder="e.g. Wed night open play"
              />
            </label>
            <Button type="submit" className="mt-2 w-full">
              Start session
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
