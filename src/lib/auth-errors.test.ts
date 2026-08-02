import { describe, expect, it } from "vitest";
import { authErrorMessage, describeAuthError } from "./auth-errors";

describe("describeAuthError", () => {
  it("classifies project-wide email rate limits", () => {
    const info = describeAuthError(new Error("Email rate limit exceeded"));
    expect(info.kind).toBe("rate_limit");
    expect(info.retryAfter).toBeUndefined();
  });

  it("classifies over_email_send_rate_limit codes", () => {
    expect(describeAuthError("over_email_send_rate_limit").kind).toBe("rate_limit");
  });

  it("extracts the retry delay from cooldown errors", () => {
    const info = describeAuthError(
      new Error("For security purposes, you can only request this after 54 seconds."),
    );
    expect(info).toMatchObject({ kind: "cooldown", retryAfter: 54 });
    expect(info.message).toContain("54 seconds");
  });

  it("falls back to a generic cooldown message when no delay is present", () => {
    const info = describeAuthError(new Error("Too many requests"));
    expect(info.kind).toBe("cooldown");
    expect(info.retryAfter).toBeUndefined();
    expect(info.message).toBe("Too many attempts. Wait a moment and try again.");
  });

  it("treats HTTP 429 as a cooldown", () => {
    expect(describeAuthError("Request failed with status 429").kind).toBe("cooldown");
  });

  it("classifies bad credentials", () => {
    expect(describeAuthError(new Error("Invalid login credentials"))).toEqual({
      kind: "credentials",
      message: "Email or password is incorrect.",
    });
  });

  it("classifies unconfirmed emails", () => {
    expect(describeAuthError(new Error("Email not confirmed")).kind).toBe("unconfirmed");
  });

  it.each(["User already registered", "email has already been registered", "user_already_exists"])(
    "classifies %s as already_registered",
    (raw) => {
      expect(describeAuthError(raw).kind).toBe("already_registered");
    },
  );

  it("classifies weak passwords", () => {
    const info = describeAuthError(new Error("Password should be at least 6 characters"));
    expect(info.kind).toBe("weak_password");
    expect(info.message).toContain("too weak");
  });

  it("gives breach-specific advice for pwned passwords", () => {
    const info = describeAuthError(new Error("This password is known to be pwned"));
    expect(info.kind).toBe("weak_password");
    expect(info.message).toContain("known data breach");
  });

  it("classifies expired links", () => {
    expect(describeAuthError(new Error("otp_expired")).kind).toBe("expired_link");
  });

  it("classifies missing backend configuration", () => {
    const info = describeAuthError(new Error("Missing Supabase environment variables"));
    expect(info.kind).toBe("config");
    expect(info.message).toContain("backend configuration");
  });

  it("classifies a disabled OAuth provider", () => {
    const info = describeAuthError(new Error("Unsupported provider: provider is not enabled"));
    expect(info).toEqual({
      kind: "config",
      message: "Google sign-in isn't enabled on this project yet.",
    });
  });

  it.each(["Failed to fetch", "NetworkError when attempting to fetch resource", "Load failed"])(
    "classifies %s as a network error",
    (raw) => {
      expect(describeAuthError(raw).kind).toBe("network");
    },
  );

  it("passes through unrecognised messages", () => {
    expect(describeAuthError(new Error("Kaboom"))).toEqual({ kind: "unknown", message: "Kaboom" });
  });

  it("falls back to a generic message for empty errors", () => {
    expect(describeAuthError("")).toEqual({
      kind: "unknown",
      message: "Something went wrong. Please try again.",
    });
  });

  it("stringifies non-Error, non-string values", () => {
    expect(describeAuthError({ nope: true }).message).toBe("[object Object]");
  });
});

describe("authErrorMessage", () => {
  it("returns only the message of the described error", () => {
    expect(authErrorMessage(new Error("Invalid login credentials"))).toBe(
      "Email or password is incorrect.",
    );
  });
});
