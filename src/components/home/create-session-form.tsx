import { createSession } from "@/app/actions";

const FIELD_CLASS =
  "h-12 w-full rounded-xl border-[1.5px] border-line bg-surface px-3.5 text-[16px] text-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-green focus:shadow-[0_0_0_4px_rgba(6,96,63,0.12)]";

const LABEL_CLASS = "mb-1.5 block text-[12px] font-semibold text-muted";

/**
 * The homepage's one job (spec §3.4). Plain server-rendered form posting to
 * `createSession`, so it works before hydration and without JavaScript.
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
          <input
            id="sessionName"
            name="sessionName"
            required
            className={FIELD_CLASS}
          />
        </div>
      </div>

      <button
        type="submit"
        className="h-[50px] w-full rounded-[14px] bg-green text-[16px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(6,96,63,0.6)] transition-[transform,box-shadow] duration-200 ease-brand hover:-translate-y-px hover:shadow-[0_14px_26px_-12px_rgba(6,96,63,0.7)]"
      >
        Mulai sesi
      </button>

      <p className="mt-3 text-center text-[12px] text-faint">
        Gratis. Nama pemain cuma disimpan selama sesi berjalan.
      </p>
    </form>
  );
}
