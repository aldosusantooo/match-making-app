import { describe, expect, it } from "vitest";
import { createBeforeSend, scrubUrl } from "../analytics";

const ORIGIN = "https://bisai.id";

describe("scrubUrl", () => {
  it("hides the session id", () => {
    expect(scrubUrl(`${ORIGIN}/s/clx9abc123`)).toBe(`${ORIGIN}/s/[id]`);
  });

  it("drops the new-session flag but keeps UTM params", () => {
    expect(
      scrubUrl(`${ORIGIN}/s/clx9abc123?new=1&utm_source=instagram`),
    ).toBe(`${ORIGIN}/s/[id]?utm_source=instagram`);
  });

  it("leaves other pages and their query alone", () => {
    expect(scrubUrl(`${ORIGIN}/?utm_source=instagram&utm_medium=bio`)).toBe(
      `${ORIGIN}/?utm_source=instagram&utm_medium=bio`,
    );
  });

  it("scrubs same-origin paths and returns a path", () => {
    expect(scrubUrl("/s/clx9abc123?new=1")).toBe("/s/[id]");
  });
});

describe("createBeforeSend", () => {
  const view = (path: string, extra: Record<string, unknown> = {}) => ({
    website: "w",
    url: `${ORIGIN}${path}`,
    title: "Jumat mabar Budi · Bisai",
    referrer: "",
    ...extra,
  });

  it("drops the second view of a new session's page", () => {
    let time = 0;
    const beforeSend = createBeforeSend(() => time);
    expect(beforeSend("event", view("/s/abc?new=1"))).not.toBeNull();
    time = 300;
    expect(beforeSend("event", view("/s/abc"))).toBeNull();
  });

  it("keeps a real return to the same page", () => {
    let time = 0;
    const beforeSend = createBeforeSend(() => time);
    beforeSend("event", view("/"));
    time = 60_000;
    expect(beforeSend("event", view("/"))).not.toBeNull();
  });

  it("keeps two different sessions opened back to back", () => {
    const beforeSend = createBeforeSend(() => 0);
    beforeSend("event", view("/s/abc"));
    expect(beforeSend("event", view("/s/def"))).not.toBeNull();
  });

  it("never drops custom events", () => {
    const beforeSend = createBeforeSend(() => 0);
    beforeSend("event", view("/s/abc"));
    expect(
      beforeSend("event", view("/s/abc", { name: "match-started" })),
    ).not.toBeNull();
  });

  it("scrubs url, same-origin referrer and session title", () => {
    const beforeSend = createBeforeSend(() => 0);
    expect(
      beforeSend("event", view("/s/abc", { referrer: "/s/abc?new=1" })),
    ).toMatchObject({
      url: `${ORIGIN}/s/[id]`,
      referrer: "/s/[id]",
      title: "Sesi · Bisai",
    });
  });

  it("keeps external referrers and homepage titles", () => {
    const beforeSend = createBeforeSend(() => 0);
    expect(
      beforeSend(
        "event",
        view("/", {
          referrer: "https://l.instagram.com/",
          title: "Bisai · Atur giliran mabar badminton",
        }),
      ),
    ).toMatchObject({
      referrer: "https://l.instagram.com/",
      title: "Bisai · Atur giliran mabar badminton",
    });
  });
});
