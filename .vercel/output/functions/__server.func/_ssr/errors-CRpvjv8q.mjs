//#region node_modules/.nitro/vite/services/ssr/assets/errors-CRpvjv8q.js
function errorMessage(e, fallback = "Unexpected error") {
	if (e instanceof Error) return e.message;
	if (typeof e === "string" && e) return e;
	return fallback;
}
/**
* Reports a failure that must not abort the current request (e.g. best-effort
* persistence after an AI call the user already paid for) without hiding it.
*/
function logNonFatal(scope, e) {
	console.error(`[${scope}] ${errorMessage(e)}`, e);
}
//#endregion
export { logNonFatal as n, errorMessage as t };
