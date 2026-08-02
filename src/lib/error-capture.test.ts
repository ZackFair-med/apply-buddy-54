import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Listener = (event: unknown) => void;

/**
 * The module registers its listeners at import time, so each test imports a
 * fresh copy with `addEventListener` stubbed to capture the handlers.
 */
async function loadModule() {
  const listeners = new Map<string, Listener>();
  vi.stubGlobal("addEventListener", (type: string, listener: Listener) =>
    listeners.set(type, listener),
  );
  vi.resetModules();
  const mod = await import("./error-capture");
  return { ...mod, listeners };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("consumeLastCapturedError", () => {
  it("returns undefined when nothing was captured", async () => {
    const { consumeLastCapturedError } = await loadModule();
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("returns the error from an error event and clears it", async () => {
    const { consumeLastCapturedError, listeners } = await loadModule();
    const error = new Error("boom");
    listeners.get("error")!({ error });

    expect(consumeLastCapturedError()).toBe(error);
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("falls back to the event itself when it carries no error", async () => {
    const { consumeLastCapturedError, listeners } = await loadModule();
    const event = { type: "error" };
    listeners.get("error")!(event);

    expect(consumeLastCapturedError()).toBe(event);
  });

  it("captures the reason of an unhandled rejection", async () => {
    const { consumeLastCapturedError, listeners } = await loadModule();
    listeners.get("unhandledrejection")!({ reason: "nope" });

    expect(consumeLastCapturedError()).toBe("nope");
  });

  it("keeps the most recent error", async () => {
    const { consumeLastCapturedError, listeners } = await loadModule();
    listeners.get("error")!({ error: new Error("first") });
    listeners.get("error")!({ error: new Error("second") });

    expect(consumeLastCapturedError()).toMatchObject({ message: "second" });
  });

  it("drops errors older than the 5s TTL", async () => {
    const { consumeLastCapturedError, listeners } = await loadModule();
    listeners.get("error")!({ error: new Error("stale") });

    vi.advanceTimersByTime(5_001);
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("still returns an error captured just inside the TTL", async () => {
    const { consumeLastCapturedError, listeners } = await loadModule();
    listeners.get("error")!({ error: new Error("fresh") });

    vi.advanceTimersByTime(4_999);
    expect(consumeLastCapturedError()).toMatchObject({ message: "fresh" });
  });
});
