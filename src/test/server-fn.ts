/**
 * Test harness for `createServerFn` modules.
 *
 * The real TanStack Start builder needs a server runtime, so tests replace the
 * module with `reactStartMock()`. The mock keeps the builder chain intact and
 * exposes each server function as a plain callable that takes the request data
 * and the middleware context the handler would normally receive.
 */
type Validator = (data: unknown) => unknown;
type Handler = (opts: { data: unknown; context: unknown }) => unknown;

export type ServerFnCall = { data?: unknown; context?: unknown };

export interface TestServerFn {
  (args?: ServerFnCall): Promise<unknown>;
  /** Runs only the input validator, so schema rules can be asserted directly. */
  validate(data: unknown): unknown;
}

export function reactStartMock() {
  function createServerFn() {
    let validator: Validator | undefined;
    const builder = {
      middleware: () => builder,
      inputValidator(fn: Validator) {
        validator = fn;
        return builder;
      },
      handler(fn: Handler) {
        const run = (args: ServerFnCall = {}) =>
          Promise.resolve(
            fn({ data: validator ? validator(args.data) : args.data, context: args.context }),
          );
        run.validate = (data: unknown) => (validator ? validator(data) : data);
        return run;
      },
    };
    return builder;
  }

  return {
    createServerFn,
    createMiddleware: () => ({ server: (fn: unknown) => fn }),
  };
}

/** Calls a server function built by `reactStartMock`, typed as its return value. */
export function callServerFn<T>(fn: unknown, args: ServerFnCall = {}): Promise<T> {
  return (fn as TestServerFn)(args) as Promise<T>;
}

/** Runs only the input validator of a server function built by `reactStartMock`. */
export function validateInput(fn: unknown, data: unknown): unknown {
  return (fn as TestServerFn).validate(data);
}
