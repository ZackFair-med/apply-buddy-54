import { describe, expect, it } from "vitest";
import { PLAN_LIMITS, getPlanLimits } from "./plan-limits";

describe("getPlanLimits", () => {
  it("returns the free limits by default", () => {
    expect(getPlanLimits(undefined)).toBe(PLAN_LIMITS.free);
    expect(getPlanLimits(null)).toBe(PLAN_LIMITS.free);
  });

  it("returns the limits of the requested plan", () => {
    expect(getPlanLimits("free")).toBe(PLAN_LIMITS.free);
    expect(getPlanLimits("paid")).toBe(PLAN_LIMITS.paid);
  });
});

describe("PLAN_LIMITS", () => {
  it("caps public-beta usage and meters cover letters daily", () => {
    expect(PLAN_LIMITS.free).toEqual({
      cvProfiles: 3,
      matchScorePerDay: 10,
      keywordsPerDay: 10,
      coverLetterPerWeek: null,
      coverLetterPerDay: 5,
    });
  });

  it("meters paid cover letters daily and unlocks analysis", () => {
    expect(PLAN_LIMITS.paid).toEqual({
      cvProfiles: 5,
      matchScorePerDay: null,
      keywordsPerDay: null,
      coverLetterPerWeek: null,
      coverLetterPerDay: 15,
    });
  });

  it("exposes every limit key on every plan", () => {
    const keys = Object.keys(PLAN_LIMITS.free).sort();
    expect(Object.keys(PLAN_LIMITS.paid).sort()).toEqual(keys);
  });
});
