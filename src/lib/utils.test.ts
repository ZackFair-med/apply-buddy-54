import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("drops falsy values and flattens conditional inputs", () => {
    const hidden = false;
    expect(
      cn("px-2", hidden && "hidden", undefined, ["py-1", { "text-sm": true, "text-lg": false }]),
    ).toBe("px-2 py-1 text-sm");
  });

  it("lets the last conflicting tailwind class win", () => {
    expect(cn("px-2 text-sm", "px-4")).toBe("text-sm px-4");
  });

  it("returns an empty string with no inputs", () => {
    expect(cn()).toBe("");
  });
});
