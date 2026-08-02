import { vi } from "vitest";

export type QueryResult = {
  data?: unknown;
  error?: { message: string } | null;
  count?: number | null;
};

export type RecordedOp = { table: string; name: string; args: unknown[] };

export type SupabaseStubOptions = {
  /**
   * Result(s) each table resolves with. An array is consumed one entry per
   * terminal call (`await`, `.single()`, `.maybeSingle()`); the last entry is
   * reused once the queue runs out.
   */
  tables?: Record<string, QueryResult | QueryResult[]>;
  storage?: {
    upload?: { error?: { message: string } | null };
    remove?: { error?: { message: string } | null };
    createSignedUrl?: QueryResult;
  };
};

const CHAIN_METHODS = [
  "select",
  "insert",
  "update",
  "upsert",
  "delete",
  "eq",
  "in",
  "gte",
  "order",
  "limit",
] as const;

const EMPTY: QueryResult = { data: null, error: null, count: 0 };

/** Minimal stand-in for the Supabase client used by the server functions. */
export function createSupabaseStub(options: SupabaseStubOptions = {}) {
  const ops: RecordedOp[] = [];
  const queues = new Map<string, QueryResult[]>();

  function nextResult(table: string): QueryResult {
    const configured = options.tables?.[table];
    if (!configured) return EMPTY;
    if (!Array.isArray(configured)) return configured;
    const queue = queues.get(table) ?? [...configured];
    queues.set(table, queue);
    return queue.length > 1 ? queue.shift()! : (queue[0] ?? EMPTY);
  }

  const upload = vi.fn(async () => options.storage?.upload ?? { error: null });
  const remove = vi.fn(async () => options.storage?.remove ?? { error: null });
  const createSignedUrl = vi.fn(
    async () => options.storage?.createSignedUrl ?? { data: null, error: null },
  );

  const supabase = {
    from(table: string) {
      const chain: Record<string, unknown> = {};
      const settle = () => Promise.resolve(nextResult(table));
      for (const name of CHAIN_METHODS) {
        chain[name] = (...args: unknown[]) => {
          ops.push({ table, name, args });
          return chain;
        };
      }
      chain.single = settle;
      chain.maybeSingle = settle;
      chain.then = (
        resolve: (value: QueryResult) => unknown,
        reject?: (reason: unknown) => unknown,
      ) => settle().then(resolve, reject);
      return chain;
    },
    storage: {
      from: (bucket: string) => {
        ops.push({ table: `storage:${bucket}`, name: "from", args: [bucket] });
        return { upload, remove, createSignedUrl };
      },
    },
  };

  return { supabase, ops, storage: { upload, remove, createSignedUrl } };
}

/** Ops recorded against one table, in call order. */
export function opsFor(ops: RecordedOp[], table: string) {
  return ops.filter((op) => op.table === table).map(({ name, args }) => ({ name, args }));
}
