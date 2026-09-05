import { createSession } from "@/app/actions";
import { RecentSessions } from "./recent-sessions";
import {
  FIELD_CLASS,
  LABEL_CLASS,
  SessionNameField,
  SubmitButton,
} from "./form-controls";

/**
 * The homepage's one job (spec §3.4). The form itself stays server-rendered
 * and posts to `createSession`, so it works before hydration and without
 * JavaScript; only the two controls that need the client — today's weekday
 * and the pending label — are client components.
 */
export function CreateSessionForm() {
  return (
    <form
      action={createSession}
      id="form"
      data-reveal
      data-d="4"
      className="mt-[22px] rounded-page-card border border-[rgba(23,35,28,0.06)] bg-surface p-5 shadow-page-card"
    >
      <h2 className="font-display text-[18px] font-bold">Buat sesi baru</h2>
      <p className="mt-1 mb-4 text-[13px] text-muted">
        Kamu dapat link privat. Simpan di grup WhatsApp, buka lagi kapan saja.
      </p>

      <RecentSessions />

      <div className="mb-3.5 grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS} htmlFor="hostName">
            Nama kamu
          </label>
          <input
            id="hostName"
            name="hostName"
            required
            autoComplete="name"
            placeholder="Aldo"
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="sessionName">
            Nama sesi
          </label>
          <SessionNameField />
        </div>
      </div>

      <SubmitButton />

      <p className="mt-3 text-center text-[12px] text-faint">
        Gratis. Nama pemain cuma disimpan selama sesi berjalan.
      </p>
    </form>
  );
}
