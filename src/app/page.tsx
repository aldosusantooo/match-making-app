import { createSession } from "./actions";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold">Badminton session</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Start a session and get a private link to run it from your phone. No
        password, no email.
      </p>
      <form action={createSession} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Your name</span>
          <input
            name="hostName"
            required
            autoComplete="name"
            className="rounded-lg border border-line-strong bg-card px-3 py-2.5 text-base outline-none focus:border-accent"
            placeholder="e.g. Aji"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Session name</span>
          <input
            name="sessionName"
            required
            className="rounded-lg border border-line-strong bg-card px-3 py-2.5 text-base outline-none focus:border-accent"
            placeholder="e.g. Wed night open play"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-ink px-4 py-3 text-sm font-medium text-white active:opacity-80"
        >
          Start session
        </button>
      </form>
    </main>
  );
}
