import { c as createServerFn } from "./createServerFn-BFFE07zL.mjs";
import { t as createSsrRpc } from "./createSsrRpc-BfwDcJiR.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-7KFL4zEp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/usage.functions-HrN4kXck.js
var getUsageSummary = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("787e0a959e011f95b58ac21f04b325d4cce5874ea7030722a8665f02a6063c1d"));
//#endregion
export { getUsageSummary as t };
