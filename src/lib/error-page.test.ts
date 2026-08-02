import { describe, expect, it } from "vitest";
import { renderErrorPage } from "./error-page";

describe("renderErrorPage", () => {
  it("renders a self-contained HTML document", () => {
    const html = renderErrorPage();
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("<title>This page didn't load</title>");
    expect(html).not.toContain("<script src=");
  });

  it("offers a reload and a link home", () => {
    const html = renderErrorPage();
    expect(html).toContain('onclick="location.reload()"');
    expect(html).toContain('href="/"');
  });
});
