import { afterEach, describe, expect, it, vi } from "vitest";
import { reportLovableError } from "./lovable-error-reporting";

function stubWindow(pathname = "/jobs") {
  const captureException = vi.fn();
  const reportRuntimeError = vi.fn();
  vi.stubGlobal("window", {
    location: { pathname },
    __lovableEvents: { captureException },
    __lovableReportRuntimeError: reportRuntimeError,
  });
  return { captureException, reportRuntimeError };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("reportLovableError", () => {
  it("is a no-op on the server", () => {
    vi.stubGlobal("window", undefined);
    expect(() => reportLovableError(new Error("boom"))).not.toThrow();
  });

  it("forwards the error with route context and extra fields", () => {
    const { captureException } = stubWindow("/cvs");
    const error = new Error("boom");

    reportLovableError(error, { jobId: "42" });

    expect(captureException).toHaveBeenCalledWith(
      error,
      { source: "react_error_boundary", route: "/cvs", jobId: "42" },
      { mechanism: "react_error_boundary", handled: false, severity: "error" },
    );
  });

  it("reports an Error's message, stack and route to the editor hook", () => {
    const { reportRuntimeError } = stubWindow("/tailor");
    const error = new Error("boom");

    reportLovableError(error);

    expect(reportRuntimeError).toHaveBeenCalledWith({
      message: "boom",
      stack: error.stack,
      filename: "/tailor",
    });
  });

  it("summarises a thrown Response instead of [object Response]", () => {
    const { reportRuntimeError } = stubWindow();

    reportLovableError(new Response("nope", { status: 404 }));

    const payload = reportRuntimeError.mock.calls[0][0];
    expect(payload.message).toMatch(/^Response 404/);
    expect(payload.stack).toBeUndefined();
  });

  it("stringifies non-Error values", () => {
    const { reportRuntimeError } = stubWindow();

    reportLovableError("plain failure");

    expect(reportRuntimeError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "plain failure", stack: undefined }),
    );
  });

  it("tolerates a preview environment without the Lovable hooks", () => {
    vi.stubGlobal("window", { location: { pathname: "/" } });
    expect(() => reportLovableError(new Error("boom"))).not.toThrow();
  });
});
